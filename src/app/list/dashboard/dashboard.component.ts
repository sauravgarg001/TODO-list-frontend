import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus, faShareSquare, faShare, faEye, faPen, faMinus, faRemoveFormat, faUndo } from '@fortawesome/free-solid-svg-icons';
import { SocketService } from 'src/app/socket.service';
import { ListService } from '../list.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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

  private authToken: string;
  private userId: string;
  public search: string;
  public searchFriend: string;
  public lists;
  public list;
  private friends;

  constructor(public appService: AppService, public listService: ListService, public sockerService: SocketService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user

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
                this.friends = user.friends;
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

      getLists()
        .then(getFriends)
        .then(getList)
        .then(msg => {
          console.info(msg);
        })
        .catch(err => {
          alert(err);
        })
    }
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
    this.listService.removeList(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          let index = -1;
          for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].listId == listId) {
              index = i;
              break;
            }
          }
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

  public undoChanges() {
    if (!this.list)
      return;
    let data = {
      listId: this.list.listId
    }
    this.listService.undo(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.list.tasks = apiResponse.data;
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
