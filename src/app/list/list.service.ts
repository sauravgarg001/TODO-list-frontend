import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from "ng2-cookies/ng2-cookies";

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private url = 'http://localhost:3000/api/v1/lists';

  constructor(private http: HttpClient) { }

  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }

  public createList(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('name', data.name);

    return this.http.post(`${this.url}/`, params);
  }

  public removeList(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId);

    return this.http.delete(`${this.url}/`, { params: params });
  }

  public getList(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId);
    return this.http.get(`${this.url}/`, { params: params });
  }

  public getLists(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'));
    return this.http.get(`${this.url}/all`, { params: params });
  }

  public markListAsActive(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId);
    return this.http.put(`${this.url}/mark/active`, params);
  }

  public addTask(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('text', data.text)
      .set('listId', data.listId)
      .set('index', data.index);
    return this.http.post(`${this.url}/task`, params);
  }

  public removeTask(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('index', data.index);
    return this.http.delete(`${this.url}/task`, { params: params });
  }

  public markTaskAsDone(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('index', data.index);
    return this.http.put(`${this.url}/task/mark/done`, params);
  }

  public markTaskAsOpen(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('index', data.index);
    return this.http.put(`${this.url}/task/mark/open`, params);
  }

  public addContributor(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('email', data.email)
      .set('listId', data.listId)
      .set('name', data.name)
      .set('canEdit', data.canEdit);
    return this.http.post(`${this.url}/contributers`, params);
  }

  public removeContributor(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('email', data.email);
    return this.http.delete(`${this.url}/contributers`, { params: params });
  }

  public grantAccessToEdit(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('email', data.email);
    return this.http.put(`${this.url}/contributers/access/edit`, params);
  }

  public grantAccessToRead(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'))
      .set('listId', data.listId)
      .set('email', data.email);
    return this.http.put(`${this.url}/contributers/access/read`, params);
  }
}
