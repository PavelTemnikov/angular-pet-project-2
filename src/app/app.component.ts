import { Component } from '@angular/core';
import { AuthenticationService } from './_services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'angular-pet-project';

    constructor(private _authenticationService: AuthenticationService) { }

    logout() {
        this._authenticationService.logout().subscribe();
    }
}
