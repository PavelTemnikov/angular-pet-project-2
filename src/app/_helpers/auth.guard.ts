import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../_services';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private _authenticationService: AuthenticationService, private _router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
    {
        if (this._authenticationService.userValue) {
            return true;

        } else {
            this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return true;
        }
    }

}
