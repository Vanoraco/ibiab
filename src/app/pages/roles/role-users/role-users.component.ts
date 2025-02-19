import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef, Inject } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-dialog',
  template: `
    <h2 mat-dialog-title>New User</h2>
    <mat-dialog-content>
      <form #userForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput [(ngModel)]="user.fname" name="fname" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput [(ngModel)]="user.lname" name="lname" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="user.email" name="email" type="email" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="user.password" name="password" type="password" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Phone</mat-label>
          <input matInput [(ngModel)]="user.phone" name="phone">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Branch</mat-label>
          <mat-select [(ngModel)]="user.branch_id" name="branch_id" required>
            <mat-option *ngFor="let branch of branches" [value]="branch.branch_id">
              {{branch.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!userForm.form.valid" (click)="save()">Save</button>
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

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { roleId: string },
    private supabaseService: SupabaseService
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
      
    } catch (error) {
      console.error('Error saving user:', error);
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
    private cdr: ChangeDetectorRef
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

  // ... existing code ...
openNewUserDialog() {
  const dialogRef = this.dialog.open(UserDialogComponent, {
    width: '500px',
    data: { roleId: this.roleId }
  });

  dialogRef.afterClosed().subscribe(newUser => {
    if (newUser) {
      this.users = [...this.users, newUser];
      this.cdr.detectChanges();
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
}
