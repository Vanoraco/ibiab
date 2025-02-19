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
import { NotesService } from '../../../services/notes.service';
@Component({
  selector: 'app-note-dialog',
  template: `
    <h2 mat-dialog-title>New Note</h2>
    <mat-dialog-content>
      <form #noteForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Subject</mat-label>
          <input matInput [(ngModel)]="note.subject" name="subject" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Note For</mat-label>
          <input matInput [(ngModel)]="note.notefor" name="notefor" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="note.description" name="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Start Time</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="note.start_time" name="start_time">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>End Time</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="note.end_time" name="end_time">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!noteForm.form.valid" (click)="save()">Save</button>
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
export class NoteDialogComponent {
  note: any = {};

  constructor(public dialogRef: MatDialogRef<NoteDialogComponent>) {}

  save() {
    this.dialogRef.close(this.note);
  }
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
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
export class NotesComponent implements OnInit {
  displayedColumns: string[] = ['subject', 'notefor', 'startTime', 'endTime', 'totalMinutes', 'description', 'enteredBy', 'actions'];
  notes: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private NotesService: NotesService,
    private dialog: MatDialog
  ) {}



  async ngOnInit() {
    //await this.loadNotes();
  this.notes = await this.NotesService.loadNotes() || [];

  }


  openNewNoteDialog() {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const session = this.supabaseService.currentSession();
          if (!session?.user?.id) throw new Error('No user session');

          const { error } = await this.supabaseService.getSupabase()
            .from('notes')
            .insert([{
              ...result,
              notefor: session.user.id,
              enteredby_userid: session.user.id,
               subject: result.subject,      // Ensure subject is defined
               description: result.description, 
               start_time: result.start_time,  // Ensure start time is defined
              end_time: result.end_time,  
              total_minutes: this.calculateTotalMinutes(result.start_time, result.end_time)
            }]);

          if (error) throw error;
  this.notes = await this.NotesService.loadNotes() || [];
        } catch (error) {
          console.error('Error creating note:', error);
        }
      }
    });
  }

  private calculateTotalMinutes(start: Date, end: Date): number {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / 1000 / 60);
  }
}