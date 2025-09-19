import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Redirect unauthenticated users to /login
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    const user = await auth.getCurrentUser();
    if (user) return true;
  } catch {}
  return router.parseUrl('/login');
};


