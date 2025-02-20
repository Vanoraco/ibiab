import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SupabaseService } from '../../../services/supabase.service';
import { EventsService } from '../../../services/events.service';
import { EventDialogComponent } from './event-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ]
})
export class CalendarComponent implements OnInit {
  displayedColumns: string[] = ['date', 'time', 'note', 'description', 'actions'];
  events: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private EventsService: EventsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.events = await this.EventsService.loadevents() || [];
  }

  async deleteEvent(eventId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this event?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const { error } = await this.supabaseService.getSupabase()
            .from('events')
            .delete()
            .eq('id', eventId);

          if (error) throw error;

          this.events = await this.EventsService.loadevents() || [];
          this.snackBar.open('Event deleted successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });
        } catch (error) {
          console.error('Error deleting event:', error);
          this.snackBar.open('Error deleting event: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }

  openNewEventDialog() {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const session = this.supabaseService.currentSession();
          if (!session?.user) throw new Error('No user session');

          const { error } = await this.supabaseService.getSupabase()
            .from('events')
            .insert([{
              userid: session.user.id,
              date: result.date,
              time: result.time,
              note: result.note,
              description: result.description
            }]);

          if (error) throw error;
          
          this.events = await this.EventsService.loadevents() || [];
          this.snackBar.open('Event created successfully', 'Dismiss', {
            duration: 3000,
            panelClass: 'success-toast'
          });

        } catch (error) {
          console.error('Error creating event:', error);
          this.snackBar.open('Error creating event: ' + (error instanceof Error ? error.message : 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: 'error-toast'
          });
        }
      }
    });
  }
}