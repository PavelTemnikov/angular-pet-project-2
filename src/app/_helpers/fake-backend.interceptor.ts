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

    intercept(request: HttpRequest<{ username: string, password: string }>, next: HttpHandler): Observable<HttpEvent<IUser | null>> {
        const { url, method, headers, body } = request;

        return handleRoute().pipe(
            // materialize and dematerialize to delay errors too
            materialize(),
            delay(2000),
            dematerialize()
        );

        // fake backend logic
        function handleRoute(): Observable<HttpEvent<IUser | null>> {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                default:
                    return next.handle(request);
            }
        }

        function authenticate(): Observable<HttpEvent<IUser | null>> {
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

        function error(message: string): Observable<HttpEvent<IUser | null>> {
            return throwError(() => new HttpErrorResponse({ status: 400, error: {message} }));
        }

        function ok(body?: IUser): Observable<HttpEvent<IUser | null>> {
            return of(new HttpResponse({ status: 200, body }));
        }

        function generateJwtToken() {
            // create token that expires in 15 minutes
            const tokenPayload = {
                exp: Date.now() + 15 * 60 * 1000
            }
            return `fake-jwt-token.${btoa( JSON.stringify(tokenPayload) )}`;
        }

        function generateRefreshToken() {
            const token = Date.now().toString();

            // add token cookie that expires in 7 days
            const expires = new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;

            return token;
        }
    }
}
