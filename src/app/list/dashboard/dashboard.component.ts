import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
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

  private authToken: string;
  private userId: string;
  public search: string;
  public lists;
  public list;

  constructor(public appService: AppService, public listService: ListService, public sockerService: SocketService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user
      this.listService.getLists().subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.lists = apiResponse.data;
            if (!this.lists)
              return;
            for (let list of this.lists) {
              if (list.isActive) {
                this.listService.getList({ listId: list.listId }).subscribe(
                  (apiResponse) => {
                    console.log(apiResponse);
                    if (apiResponse.status === 200) {
                      this.list = apiResponse.data;
                    }
                    else {
                      alert(apiResponse.message);
                    }
                  },
                  (err) => {
                    alert(err.error.message);
                  });
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
        this.list = apiResponse.data;
        if (apiResponse.status === 200) {
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


}
