import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IDbUser } from '../_models';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private _http: HttpClient) { }

    getAll(): Observable<IDbUser[]> {
        return this._http.get<IDbUser[]>(`${environment.apiUrl}/users`);
    }
}
