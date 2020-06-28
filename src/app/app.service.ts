import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from "ng2-cookies/ng2-cookies";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private url = 'http://localhost:3000/api/v1/users';

  constructor(private http: HttpClient) { }

  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }

  public signup(data): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.url}/signup`, params);
  }

  public login(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.url}/login`, params);
  }

  public logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
    return this.http.post(`${this.url}/logout`, params);
  }

  public getUserInfoFromLocalStorage() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }
  public setUserInfoInLocalStorage(data) {
    return localStorage.setItem('userInfo', JSON.stringify(data));
  }
}
