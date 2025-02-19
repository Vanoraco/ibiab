import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { SupabaseService } from './app/services/supabase.service';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterModule]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    SupabaseService
  ]
}).catch(err => console.error(err));