import { Component, Input } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { faCheckSquare, faSquare, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

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

  constructor(public appService: AppService, public router: Router) { }

  public toggleTaskStatus(event, taskNumber: string) {
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
      task.isOpen = false;
    } else {
      task.isOpen = true;
    }
  }


  public selectTaskForAddingSubtask(event, taskNumber: string) {
    // let element = event.target.parentNode.parentElement;
    // let parentID = ('' + element.id);
    // this.selectedTask = parentID;
  }


  public removeTask(event, taskNumber: string) {
    event.stopPropagation();
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
  public addSubTask(event, taskNumber: string, text) {
    event.stopPropagation();
    let tempTaskNumber = taskNumber;
    let tasks = this.list.tasks;
    let task;

    while (tempTaskNumber.indexOf('.') != -1) {
      task = tasks[parseInt(tempTaskNumber.substring(0, tempTaskNumber.indexOf('.')))];
      tasks = task.subTasks;
      tempTaskNumber = tempTaskNumber.substring(tempTaskNumber.indexOf('.') + 1);
    }
    task = tasks[tempTaskNumber];
    let newSubTask = { text: text.value, subTasks: [], isOpen: true, createdOn: Date.now(), modifiedOn: Date.now() }
    task.subTasks.push(newSubTask);
    text.value = '';
  }
  public stopBubbling(event: MouseEvent) {
    console.log("mousedown");
    event.stopPropagation();
  }
}

export interface Task {
  text: string;
  subTasks: Task;
}