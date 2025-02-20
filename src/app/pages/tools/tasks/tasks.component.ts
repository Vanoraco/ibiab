import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { TasksService } from '../../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-task-dialog',
  template: `
    <h2 mat-dialog-title>{{data.task ? 'Edit Task' : 'New Task'}}</h2>
    <mat-dialog-content>
      <form #taskForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Subject</mat-label>
          <input matInput [(ngModel)]="task.subject" name="subject" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="task.description" name="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Start Time</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="task.starttime" name="starttime">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>End Time</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="task.endtime" name="endtime">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Assigned To</mat-label>
          <mat-select [(ngModel)]="task.assignedtouserid" name="assignedTo" required>
            <mat-option *ngFor="let user of users" [value]="user.id">
              {{user.fname}} {{user.lname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>CC To</mat-label>
          <mat-select [(ngModel)]="task.cctouserid" name="ccTo" required>
            <mat-option *ngFor="let user of users" [value]="user.id">
              {{user.fname}} {{user.lname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="task.status" name="status" required>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!taskForm.form.valid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; margin-bottom: 15px; }'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSelectModule
  ]
})
export class TaskDialogComponent implements OnInit {
  task: any = {};
  users: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    private supabaseService: SupabaseService,
    @Inject(MAT_DIALOG_DATA) public data: { task?: any }
  ) {
    if (data?.task) {
      this.task = { ...data.task };
    }
  }

  async ngOnInit() {
    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('users')
        .select('id, fname, lname');

      if (error) throw error;
      this.users = data || [];
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  save() {
    this.dialogRef.close(this.task);
  }
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ]
})
export class TasksComponent implements OnInit {
  displayedColumns: string[] = ['subject', 'description', 'startTime', 'endTime', 'assignedBy', 'assignedTo', 'cctouserid', 'status', 'actions'];
  tasks: any[] = [];

  editTask(task: any) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const { error } = await this.supabaseService.getSupabase()
            .from('tasks')
            .update({
              subject: result.subject,
              description: result.description,
              starttime: result.starttime,
              endtime: result.endtime,
              assignedtouserid: result.assignedtouserid,
              cctouserid: result.cctouserid,
              status: result.status
            })
            .eq('id', task.id);

          if (error) throw error;
          
          await this.refreshTasks();
          this.snackBar.open('Task updated successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error updating task:', error);
          this.snackBar.open('Error updating task: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }

  constructor(
    private supabaseService: SupabaseService,
    private TasksService: TasksService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.tasks = await this.TasksService.loadTasks() || [];
  }

  async deleteTask(taskId: string) {
    if (!taskId) {
      this.snackBar.open('Invalid task ID', 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this task?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const { error } = await this.supabaseService.getSupabase()
            .from('tasks')
            .delete()
            .eq('id', taskId);

          if (error) throw error;

          // Refresh the tasks list
          await this.refreshTasks();
          this.snackBar.open('Task deleted successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error deleting task:', error);
          this.snackBar.open('Error deleting task: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }

  private async refreshTasks() {
    try {
      this.tasks = await this.TasksService.loadTasks() || [];
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      this.snackBar.open('Error refreshing tasks', 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
    }
  }
  openNewTaskDialog() {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const session = this.supabaseService.currentSession();
          if (!session?.user) throw new Error('No user session');

          const { error } = await this.supabaseService.getSupabase()
            .from('tasks')
            .insert([{
              assignedbyuserid: session.user.id,
              assignedtouserid: result.assignedtouserid,
              cctouserid: result.cctouserid,
              subject: result.subject,
              description: result.description,
              starttime: result.starttime,
              endtime: result.endtime,
              status: result.status
            }]);

          if (error) throw error;
          
          this.tasks = await this.TasksService.loadTasks() || [];
          this.snackBar.open('Task created successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error creating task:', error);
          this.snackBar.open('Error creating task: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }
}






