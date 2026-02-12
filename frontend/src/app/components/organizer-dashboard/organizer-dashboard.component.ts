import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="organizer-dashboard">
      <h2>Mon tableau de bord</h2>
      @if (!auth.userId() || auth.userRole() !== 'ORGANIZER') {
        <p class="error">Accès réservé aux organisateurs.</p>
      } @else {
        @if (loading()) {
          <p>Chargement...</p>
        } @else if (events().length === 0) {
          <p class="empty">Vous n'avez pas encore d'événements.</p>
        } @else {
          <ul>
            @for (e of events(); track e.id) {
              <li>
                <a [routerLink]="['/events', e.id]">{{ e.title }}</a>
                <span class="meta">{{ e.date | date:'medium' }} · {{ e.status }} · {{ e.capacity }} spots</span>
                <div class="actions">
                  <a [routerLink]="['/events', e.id, 'edit']" class="btn">Edit</a>
                  @if (e.status === 'DRAFT') {
                    <button (click)="publish(e.id)" [disabled]="actionLoading()">Publish</button>
                  }
                  @if (e.status === 'PUBLISHED' || e.status === 'DRAFT') {
                    <button (click)="close(e.id)" [disabled]="actionLoading()">Close</button>
                  }
                </div>
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
  styles: [`
    .organizer-dashboard { padding: 1rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 0.75rem; background: var(--surface-2); border-radius: 6px; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items:center; }
    .meta { color: var(--text-muted); font-size: 0.9rem; }
    .actions { display:flex; gap:0.5rem; }
    .error { color: var(--error); }
  `]
})
export class OrganizerDashboardComponent {
  private api = inject(ApiService);
  auth = inject(AuthContextService);

  events = signal<Event[]>([]);
  loading = signal(true);
  actionLoading = signal(false);

  constructor() {
    effect(() => {
      const uid = this.auth.userId();
      if (!uid) return;
      this.loading.set(true);
      this.api.getOrganizerEvents().subscribe({
        next: ev => { this.events.set(ev); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }, { allowSignalWrites: true });
  }

  publish(id: number) {
    this.actionLoading.set(true);
    this.api.publishEvent(id).subscribe({ next: () => this.refresh(), error: () => this.actionLoading.set(false) });
  }

  close(id: number) {
    this.actionLoading.set(true);
    this.api.closeEvent(id).subscribe({ next: () => this.refresh(), error: () => this.actionLoading.set(false) });
  }

  refresh() {
    this.api.getOrganizerEvents().subscribe({ next: ev => { this.events.set(ev); this.actionLoading.set(false); }, error: () => this.actionLoading.set(false) });
  }
}
