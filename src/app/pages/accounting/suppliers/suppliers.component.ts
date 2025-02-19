import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class SuppliersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'status', 'contract', 'expiryDate', 'email', 'description', 'enteredBy', 'actions'];
  suppliers: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('suppliers')
        .select(`
          *,
          entered_by:entered_by_user_id(fname, lname)
        `);

      if (error) throw error;
      this.suppliers = data;
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  }
}