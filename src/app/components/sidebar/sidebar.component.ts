import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  roles: any[] = [];
  isLoggedIn = false;
  private authSubscription: any;
  
  menuItems = [
    {
      name: 'Dashboard',
      icon: 'space_dashboard',
      route: '/dashboard'
    },
    {
      name: 'Sign',
      icon: 'how_to_reg',
      route: '/attendance'
    },
    {
      name: 'Roles',
      icon: 'group',
      children: [] // Will be populated from database
    },
    {
      name: 'Tools',
      icon: 'build_circle',
      children: [
        { name: 'Calendar', route: '/calendar', icon: 'event' },
        { name: 'Notes', route: '/notes', icon: 'note_alt' },
        { name: 'Tasks', route: '/tasks', icon: 'task_alt' }
      ]
    },
    {
      name: 'Accounting',
      icon: 'account_balance',
      children: [
        { name: 'Customer Bills', route: '/bills', icon: 'receipt_long' },
        { name: 'Customer Payment', route: '/payments', icon: 'payments' },
        { name: 'Suppliers', route: '/suppliers', icon: 'inventory' },
        { name: 'Invoice', route: '/invoice', icon: 'description' }
      ]
    },
    {
      name: 'Settings',
      icon: 'settings',
      children: [
        { name: 'Branches', route: '/branches', icon: 'business' }
      ]
    }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Replace auth subscription with direct check
    this.isLoggedIn = !!this.supabaseService.currentSession();
    if (this.isLoggedIn) {
      await this.loadRoles();
    }
    
    // Add periodic check instead of subscriptions
    this.authSubscription = setInterval(async () => {
      const loggedIn = !!this.supabaseService.currentSession();
      if (loggedIn !== this.isLoggedIn) {
        this.isLoggedIn = loggedIn;
        if (this.isLoggedIn) await this.loadRoles();
        this.cdr.detectChanges();
      }
    }, 5000); // Check every 5 seconds
  }

  capitalizeFirst(name: string): string {
    if (!name) return '';
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      clearInterval(this.authSubscription);
    }
  }

  private async loadRoles() {
    try {
      const { data: roles, error } = await this.supabaseService
        .getSupabase()
        .from('roles')
        .select('*');

      if (error) throw error;

      
    
      this.roles = roles;
      const roleMenuItem = this.menuItems.find(item => item.name === 'Roles');
      if (roleMenuItem) {
        roleMenuItem.children = roles.map((role: any) => ({
          name: this.capitalizeFirst(role.name) ,
          route: `/roles/${role.role_id}`,
          icon: 'people'
        }));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  }

  
  

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.isLoggedIn = false;
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}