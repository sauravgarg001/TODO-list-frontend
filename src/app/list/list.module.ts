import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SubtaskComponent } from './dashboard/subTask.component';
import { SearchPipe } from './dashboard/search.pipe';



@NgModule({
  declarations: [DashboardComponent, SubtaskComponent, SearchPipe],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent }
    ]),
    FormsModule,
    FontAwesomeModule
  ]
})
export class ListModule { }
