import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class BillsComponent implements OnInit {
  displayedColumns: string[] = ['billNumber', 'customerName', 'amount', 'status', 'dueDate', 'actions'];
  bills: any[] = [];

  constructor() {}

  ngOnInit() {
    // TODO: Implement bills loading logic
  }
}