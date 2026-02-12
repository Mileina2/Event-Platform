import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';
import { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-registrations">
      <h2>My Registrations</h2>
      @if (!auth.userId()) {
        <p>Please select a user to see registrations.</p>
      } @else if (loading()) {
        <p>Loading...</p>
      } @else if (registrations().length === 0) {
        <p class="empty">No registrations yet.</p>
      } @else {
        <ul>
          @for (r of registrations(); track r.id) {
            <li>
              <a [routerLink]="['/events', r.eventId]">{{ r.eventTitle }}</a>
              <span class="date">{{ r.eventDate | date:'medium' }}</span>
            </li>
          }
        </ul>
      }
      <a routerLink="/events" class="back">← Back to events</a>
    </div>
  `,
  styles: [`
    .my-registrations { padding: 1rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.75rem; background: var(--surface-2); border-radius: 6px; margin-bottom: 0.5rem; }
    li a { font-weight: 600; text-decoration: none; }
    .date { display: block; font-size: 0.85rem; color: var(--text-muted); }
    .back { display: inline-block; margin-top: 1rem; color: var(--accent); text-decoration: none; }
  `]
})
export class MyRegistrationsComponent {
  api = inject(ApiService);
  auth = inject(AuthContextService);

  registrations = signal<Registration[]>([]);
  loading = signal(true);

  constructor() {
    effect(() => {
      const uid = this.auth.userId();
      this.registrations.set([]);
      if (uid) {
        this.loading.set(true);
        this.api.getUserRegistrations(uid).subscribe({
          next: r => { this.registrations.set(r); this.loading.set(false); },
          error: () => this.loading.set(false)
        });
      } else {
        this.loading.set(false);
      }
    }, { allowSignalWrites: true });
  }
}
