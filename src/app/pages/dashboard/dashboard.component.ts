import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  user: any;
  
  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    const session = this.supabaseService.currentSession();
    this.user = session?.user;
  }
}