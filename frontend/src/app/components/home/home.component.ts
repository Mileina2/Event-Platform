import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthContextService } from '../../services/auth-context.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<p>Redirection en cours...</p>`,
  styles: [`p { padding: 2rem; text-align: center; }`]
})
export class HomeComponent {
  private router = inject(Router);
  private auth = inject(AuthContextService);

  constructor() {
    effect(() => {
      const role = this.auth.userRole();
      if (role === 'ORGANIZER') {
        this.router.navigate(['/organizer-home']);
      } else {
        this.router.navigate(['/participant']);
      }
    });
  }
}
