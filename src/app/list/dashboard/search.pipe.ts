import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {
    transform(tasks: any[], filter: string): any {
        if (!tasks || !filter) {
            return tasks;
        }
        return tasks.filter(task => task.text.indexOf(filter) != -1 || this.checkSubtasks(task.subTasks, filter));
    }

    checkSubtasks(tasks, filter): boolean {
        if (!tasks)
            return false;
        for (let task of tasks) {
            if (task.text.indexOf(filter) != -1 || this.checkSubtasks(task.subTasks, filter))
                return true;
        }
        return false;
    }
}