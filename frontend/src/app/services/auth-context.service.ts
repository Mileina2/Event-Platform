import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

const STORAGE_KEY = 'event-platform-user';

@Injectable({ providedIn: 'root' })
export class AuthContextService {
  private currentUser = signal<User | null>(this.loadFromStorage());

  readonly user = this.currentUser.asReadonly();
  readonly userId = computed(() => this.currentUser()?.id ?? null);
  readonly userRole = computed(() => this.currentUser()?.role ?? 'USER');
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  private loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setUser(user: User | null) {
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
