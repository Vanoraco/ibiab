import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(private supabaseService: SupabaseService) {}

    async loadTasks() {
    const { data, error } = await this.supabaseService
    .getSupabase()
    .from('tasks')
    .select(`
      id,
      subject,
      description,
      starttime,
      endtime,
      status,
      assignedbyuserid (fname, lname),
      assignedtouserid (fname, lname),
      cctouserid (fname, lname)
    `)
    .order('starttime', { ascending: false });
  
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
      assignedBy: task.assignedbyuserid ? `${task.assignedbyuserid.fname} ${task.assignedbyuserid.lname}` : 'Unknown',
    assignedTo: task.assignedtouserid ? `${task.assignedtouserid.fname} ${task.assignedtouserid.lname}` : 'Unknown',
      ccTo: task.cctouserid ? `${task.cctouserid.fname} ${task.cctouserid.lname}` : 'Unknown'

  }));
  }
  }


