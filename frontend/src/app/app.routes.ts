import { Routes } from '@angular/router';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { MyRegistrationsComponent } from './components/my-registrations/my-registrations.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'participant', loadComponent: () => import('./components/participant-home/participant-home.component').then(m => m.ParticipantHomeComponent), canActivate: [authGuard] },
  { path: 'organizer-home', loadComponent: () => import('./components/organizer-home/organizer-home.component').then(m => m.OrganizerHomeComponent), canActivate: [authGuard] },
  { path: 'events', component: EventListComponent, canActivate: [authGuard] },
  { path: 'events/new', component: EventFormComponent, canActivate: [authGuard] },
  { path: 'events/:id/edit', component: EventFormComponent, canActivate: [authGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [authGuard] },
  { path: 'profile/:id', loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent), canActivate: [authGuard] },
  { path: 'organizer', loadComponent: () => import('./components/organizer-dashboard/organizer-dashboard.component').then(m => m.OrganizerDashboardComponent), canActivate: [authGuard] },
  { path: 'my-registrations', component: MyRegistrationsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
