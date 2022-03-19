import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { delay, dematerialize, materialize, Observable, of, throwError } from 'rxjs';

import { IDbUser, IUser } from '../_models'

// init fake data base
const usersKey = 'jwt-refresh-token-users';
const rawUsers = localStorage.getItem(usersKey);
const users: IDbUser[] = rawUsers ? JSON.parse(rawUsers) : [];

if (!users.length) {
    users.push({
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        username: 'test',
        password: 'test',
        refreshTokens: [],
    });
    localStorage.setItem(usersKey, JSON.stringify(users));
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<{ username: string, password: string }>, next: HttpHandler): Observable<HttpEvent<IUser | IDbUser[] | void>> {
        const { url, method, headers, body } = request;

        return handleRoute().pipe(
            // materialize and dematerialize to delay errors too
            materialize(),
            delay(2000),
            dematerialize()
        );

        // fake backend logic
        function handleRoute(): Observable<HttpEvent<IUser | IDbUser[] | void>> {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/users/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                default:
                    return next.handle(request);
            }
        }

        function authenticate(): Observable<HttpEvent<IUser>> {
            if (body === null) {
                return throwError(() => new Error('body is null'));
            }
            const { username, password } = body;
            // search in fake db
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                return error('Username or password is incorrect');
            }

            user.refreshTokens.push( generateRefreshToken() );
            // update user in fake db
            localStorage.setItem(usersKey, JSON.stringify(users));

            return ok<IUser>({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                jwtToken: generateJwtToken()
            });
        }

        function refreshToken(): Observable<HttpEvent<IUser>> {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                return unauthorized();
            }
            const user = users.find(u => u.refreshTokens.includes(refreshToken));
            if (!user) {
                return unauthorized();
            }
            user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
            user.refreshTokens.push( generateRefreshToken() );
            localStorage.setItem(usersKey, JSON.stringify(users));

            return ok<IUser>({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                jwtToken: generateJwtToken()
            });
        }

        function revokeToken(): Observable<HttpEvent<void>> {
            if (!isLoggedIn()) {
                return unauthorized();
            }
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                return unauthorized();
            }
            const user = users.find(u => u.refreshTokens.includes(refreshToken));
            if (!user) {
                return unauthorized();
            }
            user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok<void>();
        }

        function getUsers(): Observable<HttpEvent<IDbUser[]>> {
            if (!isLoggedIn()) {
                return unauthorized();
            }
            return ok(users);
        }

        function ok<T>(body?: T): Observable<HttpEvent<T>> {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message: string): Observable<never> {
            return throwError(() => new HttpErrorResponse({ status: 400, error: {message} }));
        }

        function unauthorized(): Observable<never> {
            return throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Unauthorized' } }));
        }

        function generateJwtToken(): string {
            // create token that expires in 15 minutes
            const tokenPayload = {
                exp: Date.now() + 15 * 60 * 1000
            }
            return `fake-jwt-token.${btoa( JSON.stringify(tokenPayload) )}`;
        }

        function generateRefreshToken(): string {
            const token = Date.now().toString();

            // add token cookie that expires in 7 days
            const expires = new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;

            return token;
        }

        function getRefreshToken(): string | null {
            let token = null;
            const tokenString = document.cookie
                .split(';')
                .find(part => part.trim().startsWith('fakeRefreshToken'));
            if (tokenString) {
                token = tokenString.split('=')[1];
            }
            return token;
        }

        function isLoggedIn(): boolean {
            const authHeader = headers.get('Authorization');
            if (!authHeader?.startsWith('Bearer: fake-jwt-token')) {
                return false;
            }
            const jwtToken: { exp: number } = JSON.parse(
                atob(
                    authHeader.split('.')[1]
                )
            );
            if (Date.now() > jwtToken.exp) {
                return false;
            }
            return true;
        }
    }
}
