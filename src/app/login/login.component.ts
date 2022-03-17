import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public loginForm: FormGroup;
    public errorMessage = '';
    public loading = false;
    private _defaultErrorMessage = 'Some errors occur, please reload page';

    constructor(private _formBuilder: FormBuilder, private _authenticationService: AuthenticationService, private _router: Router, private _route: ActivatedRoute) { }

    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    get username() { return this.loginForm.controls['username']; }
    get password() { return this.loginForm.controls['password']; }

    onSubmit() {
        this.loading = true;
        this._authenticationService.login(this.username.value, this.password.value)
            .subscribe({
                next: () => this._router.navigate([this._route.snapshot.queryParams['returnUrl'] || '']),
                error: (error: HttpErrorResponse | Error) => {
                    this.loading = false;
                    if (error instanceof Error) {
                        this.errorMessage = this._defaultErrorMessage;
                        throw error;
                    }
                    this.errorMessage = error.error.message;
                }
            });
    }

}
