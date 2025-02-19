import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../../services/supabase.service';
import { EventsService } from '../../../services/events.service';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class CalendarComponent implements OnInit {
  displayedColumns: string[] = ['date', 'time', 'note', 'description', 'actions'];
  events: any[] = [];

  constructor(private supabaseService: SupabaseService, 
       private EventsService: EventsService,
) {}

  async ngOnInit() {
     this.events = await this.EventsService.loadevents() || [];


  }
}