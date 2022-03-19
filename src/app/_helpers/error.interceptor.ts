import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private _authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse | Error) => {
                let errorMessage: string;
                if (err instanceof HttpErrorResponse) {
                    if ([401, 403].includes(err.status) && this._authenticationService.userValue) {
                        this._authenticationService.logout();
                    }
                    errorMessage = err.error?.message || err.statusText;

                } else {
                    errorMessage = err.message
                }
                console.error(errorMessage);
                return throwError(() => err);
            })
        );
    }
}
