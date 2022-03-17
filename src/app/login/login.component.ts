import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    errorMessage = '';

    constructor(private _formBuilder: FormBuilder, private _authenticationService: AuthenticationService, private _router: Router) { }

    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    get username() { return this.loginForm.controls['username']; }
    get password() { return this.loginForm.controls['password']; }

    onSubmit() {
        this._authenticationService.login(this.username.value, this.password.value)
            .subscribe({
                next: () => this._router.navigate(['home']),
                error: (error: HttpErrorResponse | Error) => {
                    if (error instanceof Error) {
                        throw error;
                    }
                    this.errorMessage = error.error.message;
                    
                }
            });
    }

}
