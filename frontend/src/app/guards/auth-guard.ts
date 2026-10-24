import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  console.warn('[authGuard] Refus : Aucun jeton access_token trouvé dans localStorage.');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
