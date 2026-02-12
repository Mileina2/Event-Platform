import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="user-select">
      @if (auth.userId()) {
        <span class="user-info">{{ auth.user()!.email }}</span>
        <button type="button" class="logout" (click)="logout()">Se déconnecter</button>
      } @else {
        <a routerLink="/login" class="login-link">Connexion</a>
      }
    </div>
  `,
  styles: [`
    .user-select {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
    }
    .user-info {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .logout, .login-link {
      font-size: 0.85rem;
      color: var(--accent);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .login-link:hover { text-decoration: underline; }
    .logout:hover { text-decoration: underline; }
  `]
})
export class UserSelectComponent {
  private router = inject(Router);
  auth = inject(AuthContextService);

  logout() {
    this.auth.setUser(null);
    this.router.navigate(['/login']);
  }
}
