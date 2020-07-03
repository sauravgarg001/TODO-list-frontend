import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filterFriends'
})
export class FilterFriendsPipe implements PipeTransform {
    transform(users: any[], filterText: string): any {
        if (!users || !filterText) {
            return users;
        }
        return users.filter(user => this.checkUser(user, filterText));
    }

    checkUser(user, filterText): boolean {
        let name = user.user_id.firstName + ' ' + user.user_id.lastName;
        if (user.user_id.email.indexOf(filterText) != -1 ||
            name.indexOf(filterText) != -1)
            return true;
        return false;
    }
}