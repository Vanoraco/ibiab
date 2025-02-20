import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef, Inject } from '@angular/core';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-dialog',
  // Update template with validation messages
template: `
<h2 mat-dialog-title>New User</h2>
<mat-dialog-content>
  <div *ngIf="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
  <form #userForm="ngForm">
    <!-- First Name -->
    <mat-form-field class="full-width">
      <mat-label>First Name</mat-label>
      <input matInput [(ngModel)]="user.fname" name="fname" required #fname="ngModel">
      <mat-error *ngIf="fname.invalid && (fname.dirty || fname.touched)">
        First name is required
      </mat-error>
    </mat-form-field>

    <!-- Last Name -->
    <mat-form-field class="full-width">
      <mat-label>Last Name</mat-label>
      <input matInput [(ngModel)]="user.lname" name="lname" required #lname="ngModel">
      <mat-error *ngIf="lname.invalid && (lname.dirty || lname.touched)">
        Last name is required
      </mat-error>
    </mat-form-field>

    <!-- Email -->
    <mat-form-field class="full-width">
      <mat-label>Email</mat-label>
      <input matInput [(ngModel)]="user.email" name="email" 
             type="email" required email #email="ngModel">
      <mat-error *ngIf="email.invalid && (email.dirty || email.touched)">
        <div *ngIf="email.errors?.['required']">Email is required</div>
        <div *ngIf="email.errors?.['email']">Invalid email format</div>
      </mat-error>
    </mat-form-field>

    <!-- Password -->
    <mat-form-field class="full-width">
      <mat-label>Password</mat-label>
      <input matInput [(ngModel)]="user.password" name="password" 
             type="password" required minlength="8" #password="ngModel">
      <mat-error *ngIf="password.invalid && (password.dirty || password.touched)">
        <div *ngIf="password.errors?.['required']">Password is required</div>
        <div *ngIf="password.errors?.['minlength']">
          Password must be at least 8 characters
        </div>
      </mat-error>
    </mat-form-field>

    <!-- Phone -->
    <mat-form-field class="full-width">
      <mat-label>Phone</mat-label>
      <input matInput [(ngModel)]="user.phone" name="phone" 
             pattern="[0-9]{10}" #phone="ngModel">
      <mat-error *ngIf="phone.invalid && (phone.dirty || phone.touched)">
        Valid 10-digit phone number required
      </mat-error>
    </mat-form-field>

    <!-- Branch -->
    <mat-form-field class="full-width">
      <mat-label>Branch</mat-label>
      <mat-select [(ngModel)]="user.branch_id" name="branch_id" required #branch="ngModel">
        <mat-option *ngFor="let branch of branches" [value]="branch.branch_id">
          {{branch.name}}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="branch.invalid && (branch.dirty || branch.touched)">
        Branch selection is required
      </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-raised-button color="primary" 
          [disabled]="!userForm.valid" 
          (click)="save()">
    Save
  </button>
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
    MatSelectModule,
    FormsModule,
  ],
})
export class UserDialogComponent implements OnInit {
  roleId!: string; 
  user: any = {};
  branches: any[] = [];
  errorMessage: string | null = null;

  @ViewChild('userForm') userForm!: NgForm;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { roleId: string },
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {
    this.roleId = data.roleId;
  }

  async ngOnInit() {
    const { data: branches } = await this.supabaseService
      .getSupabase()
      .from('branches')
      .select('branch_id, name');
    this.branches = branches || [];
  }

  async save() {
    try {
      this.errorMessage = null;
      
      if (!this.userForm.valid) {
        this.userForm.form.markAllAsTouched();
        return;
      }

      // Create auth user first
      const { data: authUser, error: authError } = 
        await this.supabaseService.getSupabase().auth.signUp({
          email: this.user.email,
          password: this.user.password,
        });
  
      if (authError) throw authError;
  
      // Then create profile in public.users
      const userData = {
        id: authUser.user?.id,
        fname: this.user.fname,
        lname: this.user.lname,
        email: this.user.email,
        phone: this.user.phone,
        branch_id: this.user.branch_id,
        role_id: this.roleId
      };
  
      const { data, error } = await this.supabaseService.getSupabase()
        .from('users')
        .insert([userData])
        .select();
  
      if (error) throw error;
  
      this.dialogRef.close(data[0]);
      
      this.snackBar.open('User added successfully', 'Dismiss', {
        duration: 3000,
        panelClass: 'success-toast'
      });
      
    } catch (error) {
      console.error('Error saving user:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      this.snackBar.open('Error saving user: ' + this.errorMessage, 'Close', {
        duration: 5000,
        panelClass: 'error-toast'
      });
    }
  }
}

@Component({
  selector: 'app-role-users',
  templateUrl: './role-users.component.html',
  styleUrls: ['./role-users.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
})
export class RoleUsersComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'email', 'phone', 'branch', 'actions'];
  users: any[] = [];
  roleId: string = '';
  roleName: string = '';
  private selectedRoleIdSubject = new BehaviorSubject<string>('');

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.cdr.detach();
    setInterval(() => this.cdr.detectChanges(), 100);
  }

  ngOnDestroy() {
    this.selectedRoleIdSubject.complete();
  }

  async ngOnInit() {
    this.roleId = this.route.snapshot.params['id'];
    await this.loadRoleDetails();
    
    this.route.params.subscribe(async params => {
      this.roleId = params['id'];
      await this.loadRoleDetails();
      this.selectedRoleIdSubject.next(this.roleId);
    });

    this.selectedRoleIdSubject.pipe(
      distinctUntilChanged(),
      switchMap(roleId => this.loadUsersForRole(roleId))
    ).subscribe();
  }

  

  private async loadRoleDetails() {
    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .from('roles')
        .select('name')
        .eq('role_id', this.roleId)
        .single();

      if (error) throw error;
      this.roleName = data.name;
    } catch (error) {
      console.error('Error loading role details:', error);
    }
  }

  openNewUserDialog() {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { roleId: this.roleId }
    });

    dialogRef.afterClosed().subscribe(newUser => {
      if (newUser) {
        this.users = [...this.users, newUser];
        this.cdr.detectChanges();
        this.snackBar.open('User added successfully', 'Dismiss', {
          duration: 3000,
          panelClass: 'success-toast'
        });
      }
    });
  }

  private async loadUsers() {
    await this.loadUsersForRole(this.roleId);
  }

  onRoleSelected(roleId: string) {
    if (this.isValidUUID(roleId)) {
      this.selectedRoleIdSubject.next(roleId);
    } else {
      console.warn('Invalid role ID selected:', roleId);
      this.users = [];
      this.cdr.detectChanges();
    }
  }

  private async loadUsersForRole(roleId: string) {
    if (!this.isValidUUID(roleId)) {
      this.users = [];
      this.cdr.detectChanges();
      return of([]); // Return empty observable
    }

    try {
      const { data, error } = await this.supabaseService
        .getSupabase()
        .from('users')
        .select(`
          *,
          branch:branches(name)
        `)
        .eq('role_id', roleId);

      if (error) throw error;
      
      // Force new array reference
      this.users = data ? [...data] : [];
      
    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
    
    // Add markForCheck instead of detectChanges
    this.cdr.markForCheck();
    return of(this.users);
  }

  private isValidUUID(uuid: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'error-toast'
    });
  }
}
