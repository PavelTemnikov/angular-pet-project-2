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
    password: string;
    refreshTokens: string[];
}

// init fake data base
const usersKey = 'jwt-refresh-token-users';
const rawUsers = localStorage.getItem(usersKey);
const users: User[] = rawUsers ? JSON.parse(rawUsers) : [];

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

    intercept(request: HttpRequest<{ username: string, password: string }>, next: HttpHandler): Observable<HttpEvent<User | null>> {
        function error(message: string): Observable<HttpEvent<User | null>> {
            return throwError(() => new HttpErrorResponse({ status: 400, error: {message} }));
        }

        function ok(body?: User): Observable<HttpEvent<User | null>> {
            return of(new HttpResponse({ status: 200, body }));
        }

        function generateJwtToken() {
            // create token that expires in 15 minutes
            const tokenPayload = {
                exp: Date.now() + 15 * 60 * 1000
            }
            return `fake-jwt-token.${btoa( JSON.stringify(tokenPayload) )}`;
        }
        }
    }
}
