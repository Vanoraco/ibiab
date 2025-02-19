import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { DataSeedService } from '../../services/data-seed.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private dataSeedService: DataSeedService,
    private router: Router
  ) {}

  ngOnInit() {
    const session = this.supabaseService.currentSession();
    if (session) {
      console.log('Session found, navigating to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('No session found');
    }

    // Seed initial data
    this.dataSeedService.seedData();
  }

  async login() {
    try {
      this.isLoading = true;
      this.error = '';

      const { data, error } = await this.supabaseService.signIn(
        this.email,
        this.password
      );

      if (error) throw error;

      if (data.user) {
        console.log('Login successful, navigating to dashboard');
        // Session should be automatically stored by the signIn method
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Login failed:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
