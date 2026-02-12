import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Event Platform</h1>
          <p class="tagline">Gérez vos événements en toute simplicité</p>
        </div>

        <div class="auth-tabs">
          <button
            type="button"
            class="tab"
            [class.active]="isLogin()"
            (click)="setMode(true)"
          >
            Se connecter
          </button>
          <button
            type="button"
            class="tab"
            [class.active]="!isLogin()"
            (click)="setMode(false)"
          >
            Créer un compte
          </button>
        </div>

        @if (error()) {
          <div class="error-banner">{{ error() }}</div>
        }

        @if (isLogin()) {
          <form class="auth-form" (ngSubmit)="onLogin()">
            <div class="field">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="vous@exemple.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="field">
              <label for="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>
            <button type="submit" class="submit-btn" [disabled]="loading()">
              {{ loading() ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>
        } @else {
          <form class="auth-form" (ngSubmit)="onRegister()">
            <div class="field">
              <label for="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                [(ngModel)]="email"
                name="regEmail"
                placeholder="vous@exemple.com"
                required
                autocomplete="email"
              />
            </div>
            <div class="field">
              <label for="reg-password">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                [(ngModel)]="password"
                name="regPassword"
                placeholder="Au moins 6 caractères"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>
            <div class="field">
              <label for="reg-confirm">Confirmer le mot de passe</label>
              <input
                id="reg-confirm"
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                autocomplete="new-password"
              />
            </div>
            <div class="field">
              <label for="reg-role">Rôle</label>
              <select
                id="reg-role"
                [(ngModel)]="role"
                name="role"
              >
                <option value="USER">Participant</option>
                <option value="ORGANIZER">Organisateur</option>
              </select>
            </div>
            <button type="submit" class="submit-btn" [disabled]="loading() || password !== confirmPassword">
              {{ loading() ? 'Création...' : 'Créer mon compte' }}
            </button>
          </form>
        }

        <p class="hint">
          @if (isLogin()) {
            Pas encore de compte ?
            <button type="button" class="link" (click)="setMode(false)">Créer un compte</button>
          } @else {
            Déjà un compte ?
            <button type="button" class="link" (click)="setMode(true)">Se connecter</button>
          }
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%);
    }
    .auth-card {
      background: var(--surface-2);
      padding: 2.5rem;
      border-radius: 16px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      border: 1px solid var(--border);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
    }
    .tagline {
      margin: 0.5rem 0 0 0;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .auth-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      background: var(--surface-3);
      padding: 4px;
      border-radius: 10px;
    }
    .tab {
      flex: 1;
      padding: 0.6rem 1rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .tab:hover { color: var(--text); }
    .tab.active {
      background: var(--accent);
      color: white;
    }
    .error-banner {
      background: rgba(255, 107, 107, 0.15);
      color: var(--error);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .field input, .field select {
      padding: 0.7rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface-3);
      color: var(--text);
      font-size: 1rem;
    }
    .field input:focus, .field select:focus {
      outline: none;
      border-color: var(--accent);
    }
    .field input::placeholder { color: var(--text-muted); opacity: 0.7; }
    .submit-btn {
      padding: 0.85rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.95; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .hint {
      margin: 1.5rem 0 0 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .link {
      background: none;
      border: none;
      color: var(--accent);
      cursor: pointer;
      font-weight: 600;
      padding: 0;
      text-decoration: underline;
    }
    .link:hover { opacity: 0.9; }
  `]
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthContextService);
  private router = inject(Router);

  isLogin = signal(true);
  email = '';
  password = '';
  confirmPassword = '';
  role = 'USER';
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    if (this.auth.userId()) {
      this.router.navigate(['/home']);
      return;
    }
  }

  setMode(login: boolean) {
    this.isLogin.set(login);
    this.error.set(null);
  }

  onLogin() {
    this.error.set(null);
    this.loading.set(true);
    this.api.login(this.email, this.password).subscribe({
      next: user => {
        this.auth.setUser(user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.error.set(err.error?.error || 'Email ou mot de passe incorrect');
        this.loading.set(false);
      }
    });
  }

  onRegister() {
    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    this.api.registerUser(this.email, this.password, this.role).subscribe({
      next: user => {
        this.auth.setUser(user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.error.set(err.error?.error || 'Erreur lors de la création du compte');
        this.loading.set(false);
      }
    });
  }
}
