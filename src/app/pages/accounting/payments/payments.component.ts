import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class PaymentsComponent implements OnInit {
  displayedColumns: string[] = ['paymentId', 'customerName', 'amount', 'paymentDate', 'method', 'status', 'actions'];
  payments: any[] = [];

  constructor() {}

  ngOnInit() {
    // TODO: Implement payments loading logic
  }
}