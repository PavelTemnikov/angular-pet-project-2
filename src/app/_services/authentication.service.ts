import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { IUser } from '../_models';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private _userSubject$ = new BehaviorSubject<IUser | null>(null);
    public user$ = this._userSubject$.asObservable();

    public get userValue() {
        return this._userSubject$.value;
    }

    constructor(private _http: HttpClient) { }

    login(username: string, password: string): Observable<void> {
        return this._http.post<IUser>(`${environment.apiUrl}/users/authenticate`, { username, password }, { withCredentials: true })
            .pipe(
                map(user => this._userSubject$.next(user))
            );
    }
}
