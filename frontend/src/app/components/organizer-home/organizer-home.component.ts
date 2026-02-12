import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-organizer-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="organizer-home">
      <div class="hero">
        <h1>Tableau de Bord Organisateur</h1>
        <p>Créez et gérez vos événements</p>
      </div>

      <div class="quick-actions">
        <a routerLink="/events/new" class="action-card create">
          <span class="icon"></span>
          <h3>Créer un Événement</h3>
          <p>Créer un nouvel événement</p>
        </a>
        <a routerLink="/organizer" class="action-card manage">
          <span class="icon"></span>
          <h3>Gérer mes Événements</h3>
          <p>Voir et modifier mes événements</p>
        </a>
      </div>

      <div class="stats-section">
        <h2>Statistiques</h2>
        @if (loadingStats()) {
          <p>Chargement...</p>
        } @else {
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">{{ myEvents().length }}</span>
              <span class="stat-label">Mes Événements</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ publishedCount }}</span>
              <span class="stat-label">Publiés</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ draftCount }}</span>
              <span class="stat-label">Brouillons</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ closedCount }}</span>
              <span class="stat-label">Fermés</span>
            </div>
          </div>
        }
      </div>

      <div class="events-section">
        <h2>Mes Événements Récents</h2>
        @if (loadingStats()) {
          <p>Chargement...</p>
        } @else if (myEvents().length === 0) {
          <p class="empty">Vous n'avez pas encore créé d'événements. <a routerLink="/events/new">Créer un maintenant</a></p>
        } @else {
          <div class="events-list">
            @for (event of myEvents().slice(0, 5); track event.id) {
              <div class="event-item">
                <div class="event-header">
                  <h3>{{ event.title }}</h3>
                  <span class="status-badge" [class]="event.status.toLowerCase()">{{ event.status }}</span>
                </div>
                <p class="event-date">{{ event.date | date:'medium' }}</p>
                <p class="event-desc">{{ event.description }}</p>
                <div class="event-actions">
                  <a [routerLink]="['/events', event.id]" class="btn-small">Voir</a>
                  <a [routerLink]="['/events', event.id, 'edit']" class="btn-small">Éditer</a>
                </div>
              </div>
            }
            @if (myEvents().length > 5) {
              <p class="more"><a routerLink="/organizer">Voir tous mes événements</a></p>
            }
          </div>
        }
      </div>

      <div class="info-section">
        <h2>Fonctionnalités Organisateur</h2>
        <p>En tant qu'organisateur, vous pouvez :</p>
        <ul>
          <li>Créer et publier des événements</li>
          <li>Voir les inscrits et la liste d'attente</li>
          <li>Gérer les capacités et les détails</li>
          <li>Recevoir les avis et ratings</li>
          <li>Interagir avec les participants</li>
          <li>Analyser les inscriptions</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .organizer-home {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .hero {
      text-align: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 3rem 2rem;
      border-radius: 12px;
      color: white;
      margin-bottom: 2rem;
    }

    .hero h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
    }

    .hero p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.95;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      background: var(--surface-2);
      padding: 2rem;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .action-card.create:hover {
      border-color: #10b981;
      background-color: rgba(16, 185, 129, 0.1);
    }

    .action-card.manage:hover {
      border-color: #f59e0b;
      background-color: rgba(245, 158, 11, 0.1);
    }

    .action-card .icon {
      font-size: 2.5rem;
    }

    .action-card h3 {
      margin: 0;
      text-align: center;
    }

    .action-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
    }

    .stats-section {
      background: var(--surface-2);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .stat-card {
      background: var(--surface-1);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid var(--accent);
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: var(--accent);
    }

    .stat-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }

    .events-section {
      background: var(--surface-2);
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-item {
      background: var(--surface-1);
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid var(--accent);
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.5rem;
    }

    .event-header h3 {
      margin: 0;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 500;
    }

    .status-badge.draft {
      background: #fbbf24;
      color: #78350f;
    }

    .status-badge.published {
      background: #10b981;
      color: white;
    }

    .status-badge.closed {
      background: #ef4444;
      color: white;
    }

    .event-date {
      margin: 0 0 0.5rem 0;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .event-desc {
      margin: 0 0 1rem 0;
      color: var(--text);
      font-size: 0.95rem;
    }

    .event-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-small {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      background: var(--accent);
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.85rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-small:hover {
      opacity: 0.9;
    }

    .more {
      text-align: center;
      margin-top: 1rem;
    }

    .more a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }

    .empty {
      color: var(--text-muted);
    }

    .empty a {
      color: var(--accent);
    }

    .info-section {
      background: var(--surface-2);
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .info-section h2 {
      margin-top: 0;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0 0;
    }

    .info-section li {
      padding: 0.5rem 0;
      font-size: 1.05rem;
    }
  `]
})
export class OrganizerHomeComponent {
  private api = inject(ApiService);
  private auth = inject(AuthContextService);

  myEvents = signal<Event[]>([]);
  loadingStats = signal(true);

  publishedCount = 0;
  draftCount = 0;
  closedCount = 0;

  constructor() {
    this.loadMyEvents();
  }

  loadMyEvents() {
    const userId = this.auth.userId();
    if (!userId) return;

    this.api.getEvents({ organizerId: String(userId) }).subscribe({
      next: (events) => {
        this.myEvents.set(events);
        this.publishedCount = events.filter(e => e.status === 'PUBLISHED').length;
        this.draftCount = events.filter(e => e.status === 'DRAFT').length;
        this.closedCount = events.filter(e => e.status === 'CLOSED').length;
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false)
    });
  }
}
