import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-dialog',
  template: `
    <h2 mat-dialog-title>New Event</h2>
    <mat-dialog-content>
      <form #eventForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="datePicker" [(ngModel)]="event.date" name="date" required
                 [min]="minDate" [max]="maxDate" placeholder="Choose a date">
          <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
          <mat-datepicker #datePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Time</mat-label>
          <input matInput type="time" [(ngModel)]="event.time" name="time" required
                 placeholder="HH:mm" pattern="[0-9]{2}:[0-9]{2}">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Note</mat-label>
          <input matInput [(ngModel)]="event.note" name="note" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="event.description" name="description" rows="4"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!eventForm.form.valid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 15px; }
    ::ng-deep .custom-datepicker {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    ::ng-deep .mat-calendar-body-selected {
      background-color: #3f51b5;
      border-color: #3f51b5;
    }
    ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: #3f51b5;
    }
    .time-input {
      cursor: pointer;
    }
    ::ng-deep .mat-form-field-appearance-outline .mat-form-field-flex {
      cursor: pointer;
    }
  `],
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
    MatIconModule
  ]
})
export class EventDialogComponent {
  event: any = {};
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);

  constructor(public dialogRef: MatDialogRef<EventDialogComponent>) {
    this.event.date = new Date();
    this.event.time = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
  }

  save() {
    if (this.event.date && this.event.time) {
      const [hours, minutes] = this.event.time.split(':');
      const date = new Date(this.event.date);
      date.setHours(parseInt(hours), parseInt(minutes));
      this.event.date = date;
    }
    this.dialogRef.close(this.event);
  }
}