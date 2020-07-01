import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { tap } from "rxjs/operators"

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private baseUrl = 'http://localhost:3000';
  private socket;

  constructor(public http: HttpClient) {
    //handshake
    this.socket = io(this.baseUrl);
  }

  public verifyUser() {
    return Observable.create(
      (observer) => {
        this.socket.on('verifyUser',
          (data) => {
            observer.next(data);
          });
      });
  }

  public onlineUserList() {
    return Observable.create(
      (observer) => {
        this.socket.on('online-user-list',
          (userList) => {
            observer.next(userList);
          });
      });
  }

  public disconnectedSocket() {
    return Observable.create(
      (observer) => {
        this.socket.on('disconnect',
          () => {
            observer.next();
          });
      });
  }

  public setUser(authToken) {
    this.socket.emit("set-user", authToken);
  }

  public markChatAsSeen(userDetails) {
    this.socket.emit('mark-chat-as-seen', userDetails);
  }

  public getChat(senderId, receiverId, skip): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .pipe(
        tap(
          data => console.log('Data Received'),
          error => this.handleError
        )
      );
  }

  public chatByUserId(userId) {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      });
    });
  }

  public sendChatMessage(ChatMsgObject) {
    this.socket.emit('chat-msg', ChatMsgObject);
  }

  public exitSocket() {
    this.socket.disconnect();
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occured: ${err.error.message}`;
    }
    else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.error.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}
