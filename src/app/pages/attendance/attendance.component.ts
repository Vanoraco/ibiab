import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common'; // ✅ Add this


import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],// ✅ Import CommonModule here
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  displayedColumns: string[] = ['user_full_name', 'attendancedate', 'attendancetime', 'attendancetype','reason_for_signing', 'actions'];
  attendanceRecords: any[] = [];

  constructor(private attendanceService: AttendanceService) {}

  async ngOnInit() {
    console.log("hjgj");
    this.attendanceRecords = await this.attendanceService.getAllAttendance();
  }
}



