import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
}

interface DbUser extends User {
    password: string;
    refreshTokens: string[];
}

interface ResponseUser extends User {
    jwtToken: string;
}

// init fake data base
const usersKey = 'jwt-refresh-token-users';
const rawUsers = localStorage.getItem(usersKey);
const users: DbUser[] = rawUsers ? JSON.parse(rawUsers) : [];

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

    intercept(request: HttpRequest<{ username: string, password: string }>, next: HttpHandler): Observable<HttpEvent<ResponseUser | null>> {
        function authenticate(): Observable<HttpEvent<ResponseUser | null>> {
            if (body === null) {
                return error('body is null');
            }
            const { username, password } = body;
            // search in fake db
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                return error('Username or password is incorrect');
            }

            user.refreshTokens.push( generateRefreshToken() );
            // update user in fake db
            localStorage.setItem(usersKey, JSON.stringify(user));

            return ok({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                jwtToken: generateJwtToken()
            });
        }

        function error(message: string): Observable<HttpEvent<ResponseUser | null>> {
            return throwError(() => new HttpErrorResponse({ status: 400, error: {message} }));
        }

        function ok(body?: ResponseUser): Observable<HttpEvent<ResponseUser | null>> {
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
