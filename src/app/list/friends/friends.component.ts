import { Component, OnInit } from '@angular/core';
import { faCheckSquare, faSquare, faTimes, faPlus, faCheckCircle, faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
  providers: [SocketService]
})
export class FriendsComponent implements OnInit {

  //Font Awesome Icons
  public faCheckSquare = faCheckSquare;
  public faSquare = faSquare;
  public faTimes = faTimes;
  public faPlus = faPlus;
  public faTimesCircle = faTimesCircle;
  public faCheckCircle = faCheckCircle;
  public faCircle = faCircle;

  private authToken: string;
  private userId: string;
  public searchUser: string;
  public searchFriend: string;
  public searchFriendRequest: string;
  public users;
  public friends;
  public friendRequests;
  public email;
  public firstName;
  public lastName;

  constructor(public appService: AppService, public socketService: SocketService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user
      this.authError();
      this.verifyUserConfirmation();

      this.appService.getUsers().subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.users = apiResponse.data;
          }
          else {
            alert(apiResponse.message);
          }
        },
        (err) => {
          alert(err.error.message);
        });

      this.appService.getUser().subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            let user = apiResponse.data;
            this.firstName = user.firstName;
            this.lastName = user.lastName;
            this.email = user.email;
            this.friends = user.friends;
            this.getAddedFriend();
            this.getRemovedFriend()
            this.getOnlineUsers();
            this.getAddedOnlineUser();
            this.getRemovedOnlineUser();
            this.getFriendRequest();
            if (this.friends.length == 0)
              this.friends = undefined;
            else {
              for (let friend of this.friends) {
                for (let i = 0; i < this.users.length; i++) {
                  if (this.users[i].email == friend.user_id.email) {
                    this.users[i].noRequest = true;
                    break;
                  }
                }
              }
            }
            this.friendRequests = user.friendRequests;
            if (this.friendRequests.length == 0)
              this.friendRequests = undefined;
            else {
              for (let friendRequest of this.friendRequests) {
                for (let i = 0; i < this.users.length; i++) {
                  if (this.users[i].email == friendRequest.user_id.email) {
                    this.users[i].noRequest = true;
                    break;
                  }
                }
              }
            }
          }
          else {
            alert(apiResponse.message);
          }
        },
        (err) => {
          alert(err.error.message);
        });
    }
  }

  public goToHome() {
    this.socketService.exitSocket();
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 500);
  }

  public verifyUserConfirmation(): any {
    this.socketService.verifyUser().subscribe(
      () => {
        this.socketService.setUser();
      });
  }

  public authError(): any {
    this.socketService.authError().subscribe(
      (data) => {
        setTimeout(() => {
          this.logout(data.error);
        }, 200)
      });
  }

  public logout(err) {
    this.socketService.exitSocket();
    this.appService.logout().subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          alert(err || apiResponse.message);
        }
        else {
          alert(err || apiResponse.message);
        }
        Cookie.delete('authToken');
        Cookie.delete('userId');
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(err || err.error.message);
        Cookie.delete('authToken');
        Cookie.delete('userId');
        this.router.navigate(['/login']);
      });
  }

  public sendFriendRequest(email) {
    this.appService.sendFriendRequest({ email: email }).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          alert(apiResponse.message);
          this.socketService.setUpdates({
            eventName: 'add-friend-request',
            email: email,
            createdOn: Date.now(),
            firstName: this.firstName,
            lastName: this.lastName,
          });
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public acceptFriendRequest(email) {
    let index = -1;
    for (let i = 0; i < this.friendRequests.length; i++) {
      if (this.friendRequests[i].user_id.email == email) {
        index = i;
        break;
      }
    }
    let user = this.friendRequests[index];

    this.appService.acceptFriendRequest({ email: email }).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (!this.friends)
            this.friends = Array();
          this.friends.push({
            createdOn: Date.now(),
            user_id: {
              email: email,
              firstName: this.firstName,
              lastName: this.lastName,
            }
          })
          this.friendRequests.splice(index, 1);
          this.socketService.setUpdates({
            eventName: 'add-friend',
            email: email,
            createdOn: Date.now(),
            firstName: this.firstName,
            lastName: this.lastName,
          });
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public declineFriendRequest(email) {
    let index = -1;
    for (let i = 0; i < this.friendRequests.length; i++) {
      if (this.friendRequests[i].user_id.email == email) {
        index = i;
        break;
      }
    }

    let userIndex = -1;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email == email) {
        userIndex = i;
        break;
      }
    }

    this.appService.declineFriendRequest({ email: email }).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.friendRequests.splice(index, 1);
          delete this.users[userIndex].noRequest;
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public removeFriend(email) {
    let index = -1;
    for (let i = 0; i < this.friends.length; i++) {
      if (this.friends[i].user_id.email == email) {
        index = i;
        break;
      }
    }

    let userIndex = -1;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email == email) {
        userIndex = i;
        break;
      }
    }

    this.appService.removeFriend({ email: email }).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          delete this.users[userIndex].noRequest;
          this.friends.splice(index, 1);
          this.socketService.setUpdates({
            eventName: 'remove-friend',
            email: email
          });
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public getAddedFriend(): any {
    this.socketService.getAddedFriend().subscribe(
      (data) => {
        if (!this.friends)
          this.friends = Array();
        this.friends.push({
          createdOn: data.createdOn,
          user_id: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            isOnline: true
          }
        });
      });
  }

  public getFriendRequest(): any {
    this.socketService.getFriendRequest().subscribe(
      (data) => {
        for (let i = 0; i < this.friendRequests.length; i++) {
          if (this.friendRequests[i].user_id.email == data.email) {
            this.friendRequests.splice(i, 1);
            break;
          }
        }
        if (!this.friendRequests)
          this.friendRequests = Array();
        this.friendRequests.push({
          createdOn: data.createdOn,
          user_id: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        });
      });
  }

  public getRemovedFriend(): any {
    this.socketService.getRemovedFriend().subscribe(
      (data) => {
        for (let i = 0; i < this.friends.length; i++) {
          if (this.friends[i].user_id.email == data.email) {
            this.friends.splice(i, 1);
            break;
          }
        }
      });
  }

  public getOnlineUsers(): any {
    this.socketService.getOnlineUsers().subscribe(
      (onlineFriends) => {
        console.log(onlineFriends);

        for (let i = 0; i < onlineFriends.length; i++) {
          for (let j = 0; j < this.friends.length; j++) {
            if (onlineFriends[i] == this.friends[j].user_id.email) {
              this.friends[j].isOnline = true;
              break;
            }
          }
        }
      });
  }

  public getAddedOnlineUser(): any {
    this.socketService.getAddedOnlineUser().subscribe(
      (onlineFriend) => {
        for (let j = 0; j < this.friends.length; j++) {
          if (onlineFriend == this.friends[j].user_id.email) {
            this.friends[j].isOnline = true;
            break;
          }
        }
      });
  }

  public getRemovedOnlineUser(): any {
    this.socketService.getRemovedOnlineUser().subscribe(
      (onlineFriend) => {
        for (let j = 0; j < this.friends.length; j++) {
          if (onlineFriend == this.friends[j].user_id.email) {
            delete this.friends[j].isOnline;
            break;
          }
        }
      });
  }

}
