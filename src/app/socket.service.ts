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

  public setUser() {
    let data = {
      userId: Cookie.get('userId'),
      authToken: Cookie.get('authToken')
    }
    this.socket.emit('set-user', data);
  }

  public setUpdates(data) {
    data.userId = Cookie.get('userId');
    let eventName = data.eventName;
    delete data.eventName;
    this.socket.emit(eventName, data);
  }

  public authError() {
    return Observable.create((observer) => {
      this.socket.on('auth-error@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
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

  public getOnlineUsers() {
    return Observable.create((observer) => {
      this.socket.on('online-users', (data) => {
        observer.next(data);
      });
    });
  }

  public getAddedOnlineUser() {
    return Observable.create((observer) => {
      this.socket.on('online-user-add@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getRemovedOnlineUser() {
    return Observable.create((observer) => {
      this.socket.on('online-user-remove@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getUpdatedTasks() {
    return Observable.create((observer) => {
      this.socket.on('tasks@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getAddedContributer() {
    return Observable.create((observer) => {
      this.socket.on('add-contributer@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getRemovedContributer() {
    return Observable.create((observer) => {
      this.socket.on('remove-contributer@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getChangedAccessContributer() {
    return Observable.create((observer) => {
      this.socket.on('change-contributer@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getAddedFriend() {
    return Observable.create((observer) => {
      this.socket.on('add-friend@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getFriendRequest() {
    return Observable.create((observer) => {
      this.socket.on('add-friend-request@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
  }

  public getRemovedFriend() {
    return Observable.create((observer) => {
      this.socket.on('remove-friend@' + Cookie.get('authToken'), (data) => {
        observer.next(data);
      });
    });
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
