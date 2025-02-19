import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-branch-dialog',
  template: `
    <h2 mat-dialog-title>New Branch</h2>
    <mat-dialog-content>
      <form #branchForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="branch.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Type</mat-label>
          <input matInput [(ngModel)]="branch.type" name="type">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Phone</mat-label>
          <input matInput [(ngModel)]="branch.telephone" name="telephone">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="branch.email" name="email" type="email">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Address</mat-label>
          <textarea matInput [(ngModel)]="branch.address" name="address" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!branchForm.form.valid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; margin-bottom: 15px; }'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class BranchDialogComponent {
  branch: any = {};

  constructor(public dialog: MatDialog) {}

  save() {
    this.dialog.closeAll();
    return this.branch;
  }
}

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ]
})
export class BranchesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'telephone', 'email', 'address', 'actions'];
  branches: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadBranches();
  }

  private async loadBranches() {
    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('branches')
        .select('*');

      if (error) throw error;
      this.branches = data;
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }

  openNewBranchDialog() {
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const { error } = await this.supabaseService.getSupabase()
            .from('branches')
            .insert([result]);

          if (error) throw error;
          await this.loadBranches();
        } catch (error) {
          console.error('Error creating branch:', error);
        }
      }
    });
  }
}