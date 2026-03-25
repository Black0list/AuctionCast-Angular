import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Allow public access to home page
  if (state.url.includes('/home')) {
    return true;
  }

  if (auth.isLoggedIn()) return true;

  router.navigateByUrl('/login');
  return false;
};
