import { User, Session } from '@supabase/supabase-js';

export interface UserData {
  id: string;
  role_id: string;
  branch_id: string;
  fname: string;
  lname: string;
  phone: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}