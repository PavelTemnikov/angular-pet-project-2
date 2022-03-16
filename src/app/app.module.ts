import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FakeBackendInterceptor } from './_helpers/fake-backend.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
        // fake backend
        { provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true }
})
export class AppModule { }
