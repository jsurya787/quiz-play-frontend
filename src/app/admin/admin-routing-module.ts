import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboard } from './dashboard/admin-dashboard/admin-dashboard';



const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboard,
    children: [
      // Subjects
     //{ path: '', redirectTo: 'subjects', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
