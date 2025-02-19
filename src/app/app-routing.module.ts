import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component'; // Correct import
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TasksComponent } from './pages/tools/tasks/tasks.component';
import { NotesComponent } from './pages/tools/notes/notes.component';
import { CalendarComponent } from './pages/tools/calendar/calendar.component';
import { SuppliersComponent } from './pages/accounting/suppliers/suppliers.component';
import { BillsComponent } from './pages/accounting/bills/bills.component';
import { PaymentsComponent } from './pages/accounting/payments/payments.component';
import { InvoiceComponent } from './pages/accounting/invoice/invoice.component';
import { RoleUsersComponent } from './pages/roles/role-users/role-users.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { BranchesComponent } from './pages/settings/branches/branches.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'bills', component: BillsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'invoice', component: InvoiceComponent },
      { path: 'roles/:id', component: RoleUsersComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'branches', component: BranchesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
