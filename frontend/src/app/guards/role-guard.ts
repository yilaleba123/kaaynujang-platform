import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  const expectedRoles = route.data['roles'] as Array<string> | undefined;

  if (!currentUser) {
    console.warn('[roleGuard] Refus : current_user est null dans localStorage.');
    router.navigate(['/login']);
    return false;
  }

  // Vérification de la validation (les admins passent toujours)
  if (!currentUser.est_valide && currentUser.role !== 'ADMIN') {
    console.warn('[roleGuard] Refus : Compte non validé.');
    router.navigate(['/pending-validation']);
    return false;
  }

  // Vérification du rôle requis
  if (expectedRoles && expectedRoles.length > 0 && !expectedRoles.includes(currentUser.role)) {
    console.warn(
      `[roleGuard] Refus : Rôle [${currentUser.role}] non autorisé pour cette route (requis: ${expectedRoles.join(', ')}).`,
    );

    if (currentUser.role === 'ADMIN') router.navigate(['/dashboard/admin']);
    else if (currentUser.role === 'ENSEIGNANT') router.navigate(['/dashboard/teacher']);
    else router.navigate(['/dashboard/student']);

    return false;
  }

  return true;
};
