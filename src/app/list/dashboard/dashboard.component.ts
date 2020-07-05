import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus, faShareSquare, faShare, faEye, faPen, faMinus, faRemoveFormat, faUndo, faCircle } from '@fortawesome/free-solid-svg-icons';
import { SocketService } from 'src/app/socket.service';
import { ListService } from '../list.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [SocketService]
})
export class DashboardComponent implements OnInit {

  //Font Awesome Icons
  public faCheckSquare = faCheckSquare;
  public faSquare = faSquare;
  public faTimes = faTimes;
  public faPlus = faPlus;
  public faShareSquare = faShareSquare;
  public faShare = faShare;
  public faEye = faEye;
  public faMinus = faMinus;
  public faPen = faPen;
  public faRemoveFormat = faRemoveFormat;
  public faUndo = faUndo;
  public faCircle = faCircle;

  private authToken: string;
  private userId: string;
  public search: string;
  public searchFriend: string;
  public lists;
  public list;
  private friends;
  public email;
  public firstName;
  public lastName;

  constructor(public appService: AppService, public listService: ListService, public socketService: SocketService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user
      this.authError();
      this.verifyUserConfirmation();

      let getLists = () => {
        return new Promise((resolve, reject) => {
          this.listService.getLists().subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              if (apiResponse.status === 200) {
                this.lists = apiResponse.data;
                resolve();
              }
              else {
                reject(apiResponse.message);
              }
            },
            (err) => {
              reject(err.error.message);
            });
        });
      }

      let getFriends = () => {
        return new Promise((resolve, reject) => {
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
                resolve();
              }
              else {
                reject(apiResponse.message);
              }
            },
            (err) => {
              reject(err.error.message);
            });

        });
      }

      let getList = () => {
        return new Promise((resolve, reject) => {
          if (!this.lists)
            return;
          for (let list of this.lists) {
            if (list.isActive) {
              this.listService.getList({ listId: list.listId }).subscribe(
                (apiResponse) => {
                  if (apiResponse.status === 200) {
                    this.list = apiResponse.data;
                    let selfFlag = true;
                    let totalContributers = this.list.contributers.length;

                    for (let i = 0; i < this.friends.length; i++) {
                      let flag = true;
                      for (let j = 0; j < totalContributers; j++) {
                        if (this.list.contributers[j].user_id.userId == this.userId && selfFlag) {
                          this.list.contributers[j].isSelf = true;
                          this.list.canEdit = this.list.contributers[j].canEdit;
                          if (this.list.contributers[j].isOwner)
                            this.list.isOwner = true;
                          else
                            this.list.isOwner = false;
                          selfFlag = false;
                        }
                        else if (this.list.contributers[j].user_id.email == this.friends[i].user_id.email) {
                          flag = false;
                          if (!selfFlag)
                            break;
                        }
                      }
                      if (flag) {
                        this.list.contributers.push({
                          isFriend: true,
                          user_id: {
                            email: this.friends[i].user_id.email,
                            firstName: this.friends[i].user_id.firstName,
                            lastName: this.friends[i].user_id.lastName,
                          }
                        });
                      }
                    }
                    resolve('Initialization Done');
                  }
                  else {
                    reject(apiResponse.message);
                  }
                },
                (err) => {
                  reject(err.error.message);
                });
              break;
            }
          }
        });
      }

      let addUndoOnKeypress = (event: KeyboardEvent) => {
        if (event.keyCode == 90 && event.ctrlKey)
          this.undoChanges();
      }

      getLists()
        .then(getFriends)
        .then(getList)
        .then(msg => {
          console.info(msg);
          document.onkeydown = addUndoOnKeypress;
          this.getAddedContributer();
          this.getRemovedContributer();
          this.getChangedAccessContributer();
          this.getTasks();
        })
        .catch(err => {
          alert(err);
        })
    }
  }

  public goToFriends() {
    this.socketService.exitSocket();
    setTimeout(() => {
      this.router.navigate(['/friends']);
    }, 500);
  }

  public verifyUserConfirmation(): any {
    this.socketService.verifyUser().subscribe(
      () => {
        this.socketService.setUser();
      });
  }

  public getOnlineUsers(): any {
    this.socketService.getOnlineUsers().subscribe(
      (onlineFriends) => {
        for (let i = 0; i < onlineFriends.length; i++) {
          for (let j = 0; j < this.friends.length; j++) {
            if (onlineFriends[i] == this.friends[j].user_id.email) {
              this.friends[j].isOnline = true;
              if (this.list) {
                for (let k = 0; k < this.list.contributers.length; k++) {
                  if (onlineFriends[i] == this.list.contributers[k].user_id.email) {
                    this.list.contributers[k].isOnline = true;
                    break;
                  }
                }
              }
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
            if (this.list) {
              for (let k = 0; k < this.list.contributers.length; k++) {
                if (onlineFriend == this.list.contributers[k].user_id.email) {
                  this.list.contributers[k].isOnline = true;
                  break;
                }
              }
            }
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
            if (this.list) {
              for (let k = 0; k < this.list.contributers.length; k++) {
                if (onlineFriend == this.list.contributers[k].user_id.email) {
                  this.list.contributers[k].isOnline = false;
                  break;
                }
              }
            }
            break;
          }
        }
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

  public disconnectedSocket(): any {
    this.socketService.disconnectedSocket().subscribe(
      () => {
        location.reload();
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
      },
      (err) => {
        alert(err || err.error.message);
      });
    Cookie.delete('authToken');
    Cookie.delete('userId');
    this.router.navigate(['/login']);
  }

  public getAddedFriend(): any {
    this.socketService.getAddedContributer().subscribe(
      (data) => {
        this.friends.push({
          createdOn: data.createdOn,
          user_id: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        });

        let flag = true;
        for (let i = 0; i < this.list.contributers.length; i++) {
          if (this.list.contributers[i].user_id.email == data.email) {
            flag = false;
            break;
          }
        }
        if (flag) {
          this.list.contributers.push({
            isFriend: true,
            user_id: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
            }
          });
        }
      });
  }

  public getRemovedFriend(): any {
    this.socketService.getRemovedFriend().subscribe(
      (data) => {
        for (let i = 0; i < this.friends.length; i++) {
          if (this.friends.user_id.email == data.email) {
            this.friends.splice(i, 1);
            break;
          }
        }

        for (let i = 0; i < this.list.contributers.length; i++) {
          if (this.list.contributers[i].user_id.email == data.email && this.list.contributers[i].isFriend) {
            delete this.list.contributers[i].isFriend;
            break;
          }
        }
      });
  }

  public createList(listName) {
    if (!listName.value) {
      alert('Enter required fields!');
      return;
    }
    let data = {
      name: listName.value
    }
    this.listService.createList(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          let list = apiResponse.data;
          if (!this.lists)
            this.lists = Array();
          this.lists.push(list);
          listName.value = '';
          this.selectList(list.listId);
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public deleteList(event: MouseEvent, listId) {
    event.stopPropagation();
    let data = {
      listId: listId
    }
    let index = -1;
    for (let i = 0; i < this.lists.length; i++) {
      if (this.lists[i].listId == listId) {
        index = i;
        break;
      }
    }
    //RTC
    this.listService.getList({ listId: listId }).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          let list = apiResponse.data;
          for (let i = 0; i < list.contributers.length; i++) {
            if (list.contributers[i].user_id.email != this.email) {
              this.socketService.setUpdates({
                eventName: 'remove-contributer',
                listId: listId,
                email: list.contributers[i].user_id.email
              });
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

    this.listService.removeList(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.lists.splice(index, 1);
          if (this.list && this.list.listId == listId)
            this.list = undefined;
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public selectList(listId) {
    let data = {
      listId: listId,
    }
    this.listService.markListAsActive(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.list = apiResponse.data;
          let selfFlag = true;
          for (let i = 0; i < this.friends.length; i++) {
            let flag = true;
            for (let j = 0; j < this.list.contributers.length; j++) {
              if (this.list.contributers[j].user_id.userId == this.userId && selfFlag) {
                this.list.contributers[j].isSelf = true;
                this.list.canEdit = this.list.contributers[j].canEdit;
                if (this.list.contributers[j].isOwner)
                  this.list.isOwner = true;
                else
                  this.list.isOwner = false;
                selfFlag = false;
              }
              else if (this.list.contributers[j].user_id.email == this.friends[i].user_id.email) {
                flag = false;
                break;
              }
            }
            if (flag) {
              this.list.contributers.push({
                isFriend: true,
                user_id: {
                  email: this.friends[i].user_id.email,
                  firstName: this.friends[i].user_id.firstName,
                  lastName: this.friends[i].user_id.lastName,
                }
              });
            }
          }
          //change active list
          for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].listId == listId) {
              this.lists[i].isActive = true;
            } else if (this.lists[i].isActive) {
              this.lists[i].isActive = false;
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

  public addTask() {
    if (!this.search)
      return;
    let data = {
      text: this.search,
      listId: this.list.listId,
      index: -1
    }
    this.listService.addTask(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.list.tasks.push({ text: data.text, subTasks: [], isOpen: true, createdOn: Date.now(), modifiedOn: Date.now() });
          //RTC
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email != this.email && !this.list.contributers[i].isFriend) {
              this.socketService.setUpdates({
                eventName: 'tasks',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email,
                tasks: this.list.tasks
              });
            }
          }
          this.search = '';
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }

  public addToContributor(email, canEdit) {
    let data = {
      email: email,
      canEdit: canEdit,
      listId: this.list.listId,
      name: this.list.name
    }
    this.listService.addContributor(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == email) {
              delete this.list.contributers[i].isFriend;
              this.socketService.setUpdates({
                eventName: 'add-contributer',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email,
                createdOn: Date.now(),
                name: this.list.name,
                canEdit: canEdit
              });
              this.list.contributers[i].canEdit = canEdit;
              break;
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

  public getAddedContributer(): any {
    this.socketService.getAddedContributer().subscribe(
      (data) => {
        if (data.email == this.email) {
          this.lists.push({
            createdOn: data.createdOn,
            isActive: false,
            listId: data.listId,
            modifiedOn: data.createdOn,
            name: data.name
          });
        }
        else if (this.list && this.list.listId == data.listId) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == data.email) {
              delete this.list.contributers[i].isFriend;
              this.list.contributers[i].canEdit = data.canEdit;
              break;
            }
          }
        }
      });
  }

  public removeFromContributor(email) {
    let data = {
      email: email,
      listId: this.list.listId
    }
    this.listService.removeContributor(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == email) {
              this.list.contributers[i].isFriend = true;
              this.socketService.setUpdates({
                eventName: 'remove-contributer',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email
              });
              delete this.list.contributers[i].canEdit;
              break;
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

  public getRemovedContributer(): any {
    this.socketService.getRemovedContributer().subscribe(
      (data) => {
        if (data.email == this.email) {
          for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].listId == data.listId) {
              if (this.lists[i].isActive)
                this.list = undefined;
              this.lists.splice(i, 1);
              break;
            }
          }
        }
        else if (this.list.listId == data.listId) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == data.email) {
              if (this.list.contributers[i].isOwner) {
                for (let j = 0; j < this.lists.length; j++) {
                  if (this.lists[j].listId == data.listId) {
                    if (this.lists[j].isActive)
                      this.list = undefined;
                    this.lists.splice(j, 1);
                    break;
                  }
                }
                break;
              } else {
                this.list.contributers[i].isFriend = true;
                delete this.list.contributers[i].canEdit;
                break;
              }
            }
          }
        }
      });
  }

  public grantAccessToEdit(email) {
    let data = {
      email: email,
      listId: this.list.listId
    }
    this.listService.grantAccessToEdit(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == email) {
              this.socketService.setUpdates({
                eventName: 'change-contributer',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email,
                modifiedOn: Date.now(),
                canEdit: true
              });
              this.list.contributers[i].canEdit = true;
              break;
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

  public grantAccessToRead(email) {
    let data = {
      email: email,
      listId: this.list.listId
    }
    this.listService.grantAccessToRead(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == email) {
              this.socketService.setUpdates({
                eventName: 'change-contributer',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email,
                modifiedOn: Date.now(),
                canEdit: false
              });
              this.list.contributers[i].canEdit = false;
              break;
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

  public getChangedAccessContributer(): any {
    this.socketService.getChangedAccessContributer().subscribe(
      (data) => {
        if (this.list.listId == data.listId) {
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email == data.email) {
              this.list.contributers[i].canEdit = data.canEdit;
              this.list.contributers[i].modifiedOn = data.modifiedOn;
              if (this.list.contributers[i].isSelf) {
                this.list.canEdit = data.canEdit;
              }
              break;
            }
          }
        }
      });
  }

  public undoChanges() {
    if (!this.list || !this.list.canEdit)
      return;
    let data = {
      listId: this.list.listId
    }
    this.listService.undo(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.list.tasks = apiResponse.data;
          //RTC
          for (let i = 0; i < this.list.contributers.length; i++) {
            if (this.list.contributers[i].user_id.email != this.email && !this.list.contributers[i].isFriend) {
              this.socketService.setUpdates({
                eventName: 'tasks',
                listId: this.list.listId,
                email: this.list.contributers[i].user_id.email,
                tasks: this.list.tasks
              });
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

  public getTasks(): any {
    this.socketService.getUpdatedTasks().subscribe((data) => {
      if (this.list.listId == data.listId)
        this.list.tasks = data.tasks;
    });
  }
}
