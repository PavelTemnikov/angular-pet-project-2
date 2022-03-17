import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard, NotAuthGuard } from './_helpers';

const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [NotAuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: 'home' }
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
