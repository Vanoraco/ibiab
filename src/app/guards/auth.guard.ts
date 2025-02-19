import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async canActivate(): Promise<boolean> {
    const session = this.supabaseService.currentSession();
    if (!session) {
      await this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}