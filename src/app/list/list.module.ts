import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SubtaskComponent } from './dashboard/subTask.component';
import { SearchPipe } from './dashboard/search.pipe';
import { ListService } from './list.service';
import { FriendsComponent } from './friends/friends.component';
import { FilterPipe } from './friends/filter.pipe';
import { FilterFriendsPipe } from './friends/filter-friends.pipe';



@NgModule({
  declarations: [DashboardComponent, SubtaskComponent, SearchPipe, FriendsComponent, FilterPipe, FilterFriendsPipe],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent },
      { path: 'friends', component: FriendsComponent }
    ]),
    FormsModule,
    FontAwesomeModule
  ],
  providers: [ListService],
})
export class ListModule { }
