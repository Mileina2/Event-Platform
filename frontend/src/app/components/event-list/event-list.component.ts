import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="event-list">
      <div class="header">
        <h2>Events</h2>
        <div class="actions">
          @if (auth.userId() && (auth.userRole() === 'ORGANIZER')) {
            <a routerLink="/events/new" class="btn">+ New Event</a>
            <a routerLink="/organizer" class="btn">Dashboard</a>
          } @else {
            <span class="hint">Seuls les organisateurs peuvent créer des événements</span>
          }
        </div>
      </div>

      <div class="filters-panel">
        <div class="filter-group">
          <label>Search:</label>
          <input type="text" [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)" placeholder="Event title..." />
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>From:</label>
          <input type="date" [(ngModel)]="dateFromFilter" (ngModelChange)="onFilterChange()" />
        </div>

        <div class="filter-group">
          <label>To:</label>
          <input type="date" [(ngModel)]="dateToFilter" (ngModelChange)="onFilterChange()" />
        </div>

        <div class="filter-group checkbox">
          <label>
            <input type="checkbox" [(ngModel)]="onlyAvailable" (ngModelChange)="onFilterChange()" />
            Only available spots
          </label>
        </div>

        <button (click)="resetFilters()" class="btn-secondary">Reset Filters</button>

        <!-- export actions removed per product decision -->
      </div>

      @if (loading()) {
        <p>Loading...</p>
      } @else if (events().length === 0) {
        <p class="empty">No events found.</p>
      } @else {
        <div class="results-info">{{ events().length }} event(s) found</div>
        <ul>
          @for (e of events(); track e.id) {
            <li>
              <a [routerLink]="['/events', e.id]">
                <span class="title">{{ e.title }}</span>
                <span class="meta">{{ e.date | date:'medium' }} · {{ e.status }} · {{ getAvailability(e) }} spots</span>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .event-list { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn { padding: 0.5rem 1rem; background: var(--accent); color: white; border-radius: 4px; text-decoration: none; }
    .btn-secondary { padding: 0.25rem 0.75rem; background: var(--surface-2); color: var(--text); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; }
    .hint { font-size: 0.85rem; color: var(--text-muted); }

    .filters-panel { 
      background: var(--surface-2); 
      padding: 1rem; 
      border-radius: 8px; 
      margin-bottom: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); }
    .filter-group input[type="text"],
    .filter-group input[type="date"],
    .filter-group select {
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--surface-1);
      color: var(--text);
      font-size: 0.9rem;
    }
    .filter-group.checkbox label { 
      flex-direction: row; 
      align-items: center;
      gap: 0.5rem;
    }
    .filter-group.checkbox input[type="checkbox"] {
      margin: 0;
    }

    .results-info { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; }

    ul { list-style: none; padding: 0; margin: 0; }
    li { margin-bottom: 0.5rem; }
    li a { display: block; padding: 0.75rem; background: var(--surface-2); border-radius: 6px; text-decoration: none; color: inherit; }
    li a:hover { background: var(--surface-3); }
    .title { font-weight: 600; display: block; }
    .meta { font-size: 0.85rem; color: var(--text-muted); }
    .empty { color: var(--text-muted); }

    .export-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--accent-light);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }
    .export-actions label { margin: 0; font-weight: 500; }
    .export-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .export-btn:hover { opacity: 0.9; }
  `]
})
export class EventListComponent {
  private api = inject(ApiService);
  auth = inject(AuthContextService);

  events = signal<Event[]>([]);
  loading = signal(true);
  searchText = '';
  statusFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  onlyAvailable = false;

  constructor() {
    this.loadEvents();
  }

  onSearchChange(term: string) {
    this.searchText = term;
    // Debounce search to avoid too many API calls
    // For now, just load on change
    this.loadEvents();
  }

  onFilterChange() {
    this.loadEvents();
  }

  resetFilters() {
    this.searchText = '';
    this.statusFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.onlyAvailable = false;
    this.loadEvents();
  }

  loadEvents() {
    this.loading.set(true);
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.searchText) filters.search = this.searchText;
    if (this.dateFromFilter) filters.dateFrom = this.dateFromFilter;
    if (this.dateToFilter) filters.dateTo = this.dateToFilter;
    if (this.onlyAvailable) filters.hasAvailability = true;

    this.api.getEvents(filters).subscribe({
      next: ev => { this.events.set(ev); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getAvailability(event: Event): string {
    // This is calculated on the frontend; ideally backend would return registrationCount
    return `${event.capacity}`;
  }

  // Export methods removed

  // download helper removed
}

