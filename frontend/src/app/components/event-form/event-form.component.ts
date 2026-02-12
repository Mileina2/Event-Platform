import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="event-form">
      <h2>{{ isEdit() ? 'Edit Event' : 'New Event' }}</h2>
      @if (!auth.userId() || auth.userRole() !== 'ORGANIZER') {
        <p class="error">Seuls les organisateurs peuvent créer des événements. Connectez-vous avec un compte organisateur.</p>
      }
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      <form (ngSubmit)="submit()">
        <div>
          <label>Title</label>
          <input [(ngModel)]="title" name="title" required minlength="1" />
        </div>
        <div>
          <label>Description</label>
          <textarea [(ngModel)]="description" name="description" rows="3"></textarea>
        </div>
        <div>
          <label>Date</label>
          <input type="datetime-local" [(ngModel)]="date" name="date" required />
        </div>
        <div>
          <label>Capacity</label>
          <input type="number" [(ngModel)]="capacity" name="capacity" min="1" required />
        </div>
        <div class="actions">
          <button type="submit" [disabled]="saving() || !auth.userId() || auth.userRole() !== 'ORGANIZER'">{{ isEdit() ? 'Save' : 'Create' }}</button>
          <a routerLink="/events" class="cancel">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .event-form { padding: 1rem; max-width: 500px; }
    .error { color: var(--error); }
    form div { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    input, textarea { width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border); box-sizing: border-box; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    button { padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; }
    .cancel { color: var(--text-muted); text-decoration: none; }
  `]
})
export class EventFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthContextService);

  get id(): number | null {
    const p = this.route.snapshot.paramMap.get('id');
    if (p === 'new') return null;
    const n = Number(p);
    return isNaN(n) ? null : n;
  }
  isEdit = () => !!this.id;

  title = '';
  description = '';
  date = '';
  capacity = 1;
  saving = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.id;
    if (id) {
      this.api.getEvent(id).subscribe(ev => {
        this.title = ev.title;
        this.description = ev.description || '';
        this.date = ev.date.slice(0, 16);
        this.capacity = ev.capacity;
      });
    }
  }

  submit() {
    if (!this.auth.userId()) return;
    this.error.set(null);
    this.saving.set(true);
    const dto = {
      title: this.title,
      description: this.description || undefined,
      date: new Date(this.date).toISOString(),
      capacity: this.capacity
    };

    if (this.isEdit()) {
      this.api.updateEvent(this.id!, dto).subscribe({
        next: () => { this.saving.set(false); this.router.navigate(['/events', this.id]); },
        error: err => {
          this.error.set(err.error?.error || 'Update failed');
          this.saving.set(false);
        }
      });
    } else {
      this.api.createEvent(dto).subscribe({
        next: ev => { this.saving.set(false); this.router.navigate(['/events', ev.id]); },
        error: err => {
          this.error.set(err.error?.error || 'Create failed');
          this.saving.set(false);
        }
      });
    }
  }
}
