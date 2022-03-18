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

    intercept(request: HttpRequest<{ username: string, password: string }>, next: HttpHandler): Observable<HttpEvent<IUser>> {
        const { url, method, headers, body } = request;

        return handleRoute().pipe(
            // materialize and dematerialize to delay errors too
            materialize(),
            delay(2000),
            dematerialize()
        );

        // fake backend logic
        function handleRoute(): Observable<HttpEvent<IUser>> {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
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

            return ok({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                jwtToken: generateJwtToken()
            });
        }

        function ok(body?: IUser): Observable<HttpEvent<IUser>> {
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
                .find(part => part.startsWith('fakeRefreshToken'));
            if (tokenString) {
                token = tokenString.split('=')[1];
            }
            return token;
        }
    }
}
