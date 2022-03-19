import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { IUser } from '../_models';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private _refreshTokenTimeout: number;
    private _userSubject$ = new BehaviorSubject<IUser | null>(null);
    public user$ = this._userSubject$.asObservable();

    public get userValue() {
        return this._userSubject$.value;
    }

    constructor(private _http: HttpClient) { }

    login(username: string, password: string): Observable<void> {
        return this._http.post<IUser>(`${environment.apiUrl}/users/authenticate`, { username, password }, { withCredentials: true })
            .pipe( map(this._emitUser.bind(this)) );
    }

    refreshToken(): Observable<void> {
        return this._http.post<IUser>(`${environment.apiUrl}/users/refresh-token`, {}, { withCredentials: true })
            .pipe( map(this._emitUser.bind(this)) );
    }

    private _emitUser(user: IUser): void {
        this._userSubject$.next(user);
        this.startRefreshToken();
    }

    private startRefreshToken(): void {
        if (!this.userValue) {
            return;
        }
        const jwtToken: { exp: number } = JSON.parse(
            atob( 
                this.userValue.jwtToken.split('.')[1] 
            )
        )
         // set a timeout to refresh the token a minute before it expires
        const timeout = jwtToken.exp - Date.now() - 1000 * 60;
        this._refreshTokenTimeout = window.setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
}
