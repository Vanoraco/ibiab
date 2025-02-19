import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private supabaseService: SupabaseService) {}



  async getAllAttendance() {
    const { data, error } = await this.supabaseService
    .getSupabase()
    .from('attendance')
    .select(`
      attendancedate, 
      attendancetime, 
      attendancetype, 
      reason_for_signing, 
      users(fname, lname)
    `);
  
    if (error) {
      console.error('Error fetching attendance:', error.message);
      return [];
    }
  
    if (!data) {
      return [];
    }

    console.log("hjgj",data);
    return data.map((record: any) => ({
      ...record,
      user_full_name: record.users ? `${record.users.fname} ${record.users.lname}` : 'Unknown'
    }));
  }
}