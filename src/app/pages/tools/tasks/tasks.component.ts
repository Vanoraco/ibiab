import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { TasksService } from '../../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-dialog',
  template: `
    <h2 mat-dialog-title>New Task</h2>
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
    FormsModule
  ]
})
export class TaskDialogComponent {
  task: any = {};

  constructor(public dialogRef: MatDialogRef<TaskDialogComponent>) {}

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
  displayedColumns: string[] = ['subject', 'description', 'startTime', 'endTime', 'assignedBy', 'assignedTo','cctouserid','status', 'actions'];
  tasks: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private TasksService: TasksService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    //await this.loadTasks();
        this.tasks = await this.TasksService.loadTasks() || [];

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
              assignedtouserid: session.user.id,
              cctouserid: session.user.id,
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