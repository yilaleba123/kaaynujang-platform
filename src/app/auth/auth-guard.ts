import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = () => {
  // Côté serveur (SSR) il n'y a pas de localStorage : on laisse passer, le navigateur re-vérifiera.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  return inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/connexion']);
};