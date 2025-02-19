import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { UserData, AuthResponse } from '../types/supabase';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { StorageKeys } from '../constants/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }

  private getStorageKey(): string {
    const projectId = environment.supabase.url.split('.')[0].split('//')[1];
    return `sb-${projectId}-auth-token`;
  }

  getSupabase() {
    return this.supabase;
  }

  currentSession() {
    const session = localStorage.getItem(this.getStorageKey());
    return session ? JSON.parse(session) : null;
  }

  async signUp(email: string, password: string, userData: Partial<UserData>) {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await this.supabase
        .from('users')
        .insert([{ 
          id: authData.user.id,
          email,
          ...userData
        }]);

      if (profileError) throw profileError;
    }

    return authData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data?.session) {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data.session));
    }
    
    return { data, error };
  }

  async signOut() {
    localStorage.removeItem(this.getStorageKey());
    await this.supabase.auth.signOut();
  }
}