import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class InvoiceComponent implements OnInit {
  displayedColumns: string[] = ['invoiceNumber', 'customerName', 'amount', 'status', 'dueDate', 'actions'];
  invoices: any[] = [];

  constructor() {}

  ngOnInit() {
    // TODO: Implement invoices loading logic
  }
}