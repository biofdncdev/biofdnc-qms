import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

// Redirect unauthenticated users to /login
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  try {
    const user = await supabase.getCurrentUser();
    if (user) return true;
  } catch {}
  return router.parseUrl('/login');
};


