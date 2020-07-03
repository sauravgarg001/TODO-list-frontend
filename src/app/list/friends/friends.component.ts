import { Component, OnInit } from '@angular/core';
import { faCheckSquare, faSquare, faTimes, faPlus, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  //Font Awesome Icons
  public faCheckSquare = faCheckSquare;
  public faSquare = faSquare;
  public faTimes = faTimes;
  public faPlus = faPlus;
  public faTimesCircle = faTimesCircle;
  public faCheckCircle = faCheckCircle;

  private authToken: string;
  private userId: string;
  public searchUser: string;
  public searchFriend: string;
  public searchFriendRequest: string;
  public users;
  public friends;
  public friendRequests;

  constructor(public appService: AppService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user
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
            this.friends = user.friends;
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

  public sendFriendRequest(email) {
    this.appService.sendFriendRequest({ email: email }).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          alert(apiResponse.message);
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
            createdOn: Date.now,
            user_id: {
              email: email,
              firstName: user.user_id.firstName,
              lastName: user.user_id.lastName,
            }
          })
          this.friendRequests.splice(index, 1);
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
