import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(users: any[], filterText: string): any {
        if (!users || !filterText) {
            return users;
        }

        return users.filter(user => this.checkUser(user, filterText));
    }

    checkUser(user, filterText): boolean {
        let name = user.firstName + ' ' + user.lastName;
        if (user.email.indexOf(filterText) != -1 ||
            name.indexOf(filterText) != -1)
            return true;
        return false;
    }
}