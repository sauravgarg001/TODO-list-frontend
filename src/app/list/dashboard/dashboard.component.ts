import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { SocketService } from 'src/app/socket.service';

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
  public lists = [
    {
      listId: 'sgdf213',
      name: 'First 1',
      isActive: false,
      tasks: [
        { text: 'task1', subTasks: [{ text: 'task1.1', subTasks: [], isOpen: true }], isOpen: true },
        { text: 'task2', subTasks: [{ text: 'task2.1', subTasks: [], isOpen: false }, { text: 'task2.2', subTasks: [], isOpen: true }], isOpen: true },
        { text: 'task3', subTasks: [], isOpen: true },
      ],
      contributers: [

      ]
    }
  ];
  public list;

  constructor(public appService: AppService, public sockerService: SocketService, public router: Router) { }

  ngOnInit(): void {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    if (!this.authToken || !this.userId)
      this.router.navigate(['/login']);
    else {
      //verify user
    }
  }

  public createList(listName) {
    let name = listName.value
    listName.value = '';
    this.lists.push({
      listId: 'gfhy#4fd',
      name: name,
      isActive: false,
      tasks: [
        { text: 'task1', subTasks: [{ text: 'task1.1', subTasks: [], isOpen: true }], isOpen: true },
        { text: 'task2', subTasks: [{ text: 'task2.1', subTasks: [], isOpen: false }, { text: 'task2.2', subTasks: [], isOpen: true }], isOpen: true },
        { text: 'task3', subTasks: [], isOpen: true },
      ],
      contributers: [

      ]
    });
  }

  public selectList(listId) {
    for (let i = 0; i < this.lists.length; i++) {
      if (this.lists[i].listId == listId) {
        this.lists[i].isActive = true;
        this.list = this.lists[i];
      } else if (this.lists[i].isActive) {
        this.lists[i].isActive = false;
      }
    }
  }

  public addTask() {
    let task = { text: this.search, subTasks: [], isOpen: true, createdOn: Date.now(), modifiedOn: Date.now() }
    this.list.tasks.push(task);
    this.search = '';
  }

  public deleteList(listId) {
    let index = -1;
    for (let i = 0; i < this.lists.length; i++) {
      if (this.lists[i].listId == listId) {
        index = i;
        break;
      }
    }
    this.lists.splice(index, 1);
    if (this.list.listId == listId)
      this.list = undefined;
  }


}
