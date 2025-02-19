import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private supabaseService: SupabaseService) {}


async loadNotes() {
  const { data, error } = await this.supabaseService
    .getSupabase()
    .from('notes')
    .select(`
   subject,   
      start_time, 
      end_time, 
      total_minutes,
      description,
   notefor(fname, lname),
      enteredby_userid (fname, lname)`);
  
    if (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }
  
    if (!data) {
      return [];
    }

    console.log("hjgj",data);
    return data.map((task: any) => ({
      ...task,
      notefor: task.notefor ? `${task.notefor.fname} ${task.notefor.lname}` : 'Unknown',
    enteredbyuserid: task.enteredbyuserid ? `${task.enteredbyuserid.fname} ${task.enteredbyuserid.lname}` : 'Unknown'


  }));
}
  
}