import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IDbUser } from '../_models';
import { UserService } from '../_services';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    
    users$: Observable<IDbUser[]>;
    test = false;

    constructor(private _userService: UserService) { }

    ngOnInit(): void {
        this.users$ = this._userService.getAll();
    }

}
