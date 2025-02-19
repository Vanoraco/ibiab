import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserData } from '../types/supabase';

@Injectable({
  providedIn: 'root',
})
export class DataSeedService {
  constructor(private supabaseService: SupabaseService) {}

  async seedData() {
    try {
      // Check if admin user already exists
      const { data: existingUser, error: checkError } = await this.supabaseService
        .getSupabase()
        .from('users')
        .select('*')
        .eq('email', 'admin@example.com')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Only create user if they don't exist
      if (!existingUser) {
        const userData: Partial<UserData> = {
          fname: 'Admin',
          lname: 'User',
          phone: '+1234567890',
          role_id: '1', // Admin role
          branch_id: '1' // Main branch
        };

        await this.supabaseService.signUp(
          'admin@example.com',
          'Test@123',
          userData
        );
      }
    } catch (error) {
      // Ignore user_already_exists error
     // if (error.code !== 'user_already_exists') {
       // console.error('Error seeding data:', error);
      //
    }
  }
}