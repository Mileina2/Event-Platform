import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-participant-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="participant-home">
      <div class="hero">
        <h1>Découvrez les Événements</h1>
        <p>Trouvez et inscrivez-vous aux événements qui vous intéressent</p>
      </div>

      <div class="quick-actions">
        <a routerLink="/events" class="action-card">
          <span class="icon"></span>
          <h3>Explorer les Événements</h3>
          <p>Parcourez tous les événements publiés</p>
        </a>
        <a routerLink="/my-registrations" class="action-card">
          <span class="icon"></span>
          <h3>Mes Inscriptions</h3>
          <p>Voir mes événements et mon historique</p>
        </a>
        <a [routerLink]="['/profile', currentUserId()]" class="action-card">
          <span class="icon"></span>
          <h3>Mon Profil</h3>
          <p>Gérer mon profil et mes suivis</p>
        </a>
      </div>

      <div class="info-section">
        <h2>Bienvenue Participant</h2>
        <p>Vous pouvez :</p>
        <ul>
          <li>S'inscrire à des événements sans limites</li>
          <li>Ajouter vos événements préférés aux favoris</li>
          <li>Laisser des avis et des notes</li>
          <li>Suivre d'autres utilisateurs</li>
          <!--<li>Exporter la liste des événements</li>-->
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .participant-home {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .hero {
      text-align: center;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
      border-color: var(--accent);
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .action-card .icon {
      font-size: 2rem;
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

    .info-section {
      background: var(--surface-2);
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid var(--accent);
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
export class ParticipantHomeComponent {
  private auth = inject(AuthContextService);

  currentUserId() {
    return this.auth.userId();
  }
}
