import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthContextService } from '../services/auth-context.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthContextService);
  const router = inject(Router);
  if (auth.userId()) return true;
  return router.createUrlTree(['/login']);
};
