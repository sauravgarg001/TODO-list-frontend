import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';
import { LoginComponent } from './user/login/login.component';
import { AppService } from './app.service';
import { ListService } from './list/list.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    UserModule,
    ListModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '*', redirectTo: 'login' },
      { path: '**', redirectTo: 'login' }
    ]),
    HttpClientModule
  ],
  providers: [AppService, ListService],
  bootstrap: [AppComponent]
})
export class AppModule { }
