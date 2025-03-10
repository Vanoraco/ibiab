import { Component, OnInit } from '@angular/core';
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
import { NotesService } from '../../../services/notes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      this.notes = await this.NotesService.loadNotes() || [];
    } catch (error) {
      console.error('Error loading notes:', error);
      this.snackBar.open('Error loading notes', 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
    }
  }

  async deleteNote(noteId: string) {
    if (!noteId) {
      this.snackBar.open('Invalid note ID', 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this note?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const { error } = await this.supabaseService.getSupabase()
            .from('notes')
            .delete()
            .eq('id', noteId);

          if (error) throw error;

          // Refresh the notes list
          await this.refreshNotes();
          this.snackBar.open('Note deleted successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error deleting note:', error);
          this.snackBar.open('Error deleting note: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }

  private async refreshNotes() {
    try {
      this.notes = await this.NotesService.loadNotes() || [];
    } catch (error) {
      console.error('Error refreshing notes:', error);
      this.snackBar.open('Error refreshing notes', 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
    }
  }
  openNewNoteDialog() {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const session = this.supabaseService.currentSession();
          if (!session?.user) throw new Error('No user session');

          const { error } = await this.supabaseService.getSupabase()
            .from('notes')
            .insert([{
              subject: result.subject,
              notefor: result.notefor,
              description: result.description,
              start_time: result.start_time,
              end_time: result.end_time,
              user_id: session.user.id
            }]);

          if (error) throw error;
          
          this.snackBar.open('Note created successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error creating note:', error);
          this.snackBar.open('Error creating note: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }

  calculateTotalMinutes(start: Date, end: Date): number {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / 1000 / 60);
  }
}

