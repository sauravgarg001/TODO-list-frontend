import { Component, Input } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ListService } from '../list.service';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'subtask',
  templateUrl: './subtask.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class SubtaskComponent {
  @Input() list;
  @Input() tasks;
  @Input() search: string;
  @Input() taskCounter;

  //Font Awesome Icons
  public faCheckSquare = faCheckSquare;
  public faSquare = faSquare;
  public faTimes = faTimes;
  public faPlus = faPlus;

  constructor(public appService: AppService, public listService: ListService, public sockerService: SocketService, public router: Router) { }

  public toggleTaskStatus(event, taskNumber: string) {
    if (!this.list.canEdit) {
      alert('Only Read Access');
      return;
    }
    if (this.search) {
      alert("Clear search first!");
      return;
    }
    event.stopPropagation();
    let tempTaskNumber = taskNumber;
    let tasks = this.list.tasks;
    let task;

    while (tempTaskNumber.indexOf('.') != -1) {
      task = tasks[parseInt(tempTaskNumber.substring(0, tempTaskNumber.indexOf('.')))];
      tasks = task.subTasks;
      tempTaskNumber = tempTaskNumber.substring(tempTaskNumber.indexOf('.') + 1);
    }
    task = tasks[parseInt(tempTaskNumber)];

    if (task.isOpen) {
      let data = {
        listId: this.list.listId,
        index: taskNumber
      }
      this.listService.markTaskAsDone(data).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            task.isOpen = false;
          }
          else {
            alert(apiResponse.message);
          }
        },
        (err) => {
          alert(err.error.message);
        });
    } else {
      let data = {
        listId: this.list.listId,
        index: taskNumber
      }
      this.listService.markTaskAsOpen(data).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            task.isOpen = true;
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

  public removeTask(event, taskNumber: string) {
    event.stopPropagation();
    let data = {
      listId: this.list.listId,
      index: taskNumber
    }
    this.listService.removeTask(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          let tempTaskNumber = taskNumber;
          let tasks = this.list.tasks;
          let task;

          while (tempTaskNumber.indexOf('.') != -1) {
            task = tasks[parseInt(tempTaskNumber.substring(0, tempTaskNumber.indexOf('.')))];
            tasks = task.subTasks;
            tempTaskNumber = tempTaskNumber.substring(tempTaskNumber.indexOf('.') + 1);
          }
          tasks.splice(tempTaskNumber, 1);
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }
  public addSubTask(event, taskNumber: string, text) {
    event.stopPropagation();
    if (!text.value)
      return;
    let data = {
      text: text.value,
      listId: this.list.listId,
      index: taskNumber
    }
    this.listService.addTask(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          let tempTaskNumber = taskNumber;
          let tasks = this.list.tasks;
          let task;

          while (tempTaskNumber.indexOf('.') != -1) {
            task = tasks[parseInt(tempTaskNumber.substring(0, tempTaskNumber.indexOf('.')))];
            tasks = task.subTasks;
            tempTaskNumber = tempTaskNumber.substring(tempTaskNumber.indexOf('.') + 1);
          }
          task = tasks[parseInt(tempTaskNumber)];
          console.log(task);

          task.subTasks.push({ text: data.text, subTasks: [], isOpen: true, createdOn: Date.now(), modifiedOn: Date.now() });
          text.value = '';
        }
        else {
          alert(apiResponse.message);
        }
      },
      (err) => {
        alert(err.error.message);
      });
  }
  public stopBubbling(event: MouseEvent) {
    event.stopPropagation();
  }
}

export interface Task {
  text: string;
  subTasks: Task;
}