import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * 🔐 Role-Based Access Guard
 * Usage: canActivate: [roleGuard(['ADMIN', 'TEACHER'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // ✅ APP_INITIALIZER already ran bootstrapAuth() - no need to call again

    // 1. Check if logged in & has required role
    const userRole = auth.currentUser()?.role;
    
    if (auth.isAuthenticated() && allowedRoles.includes(userRole)) {
      return true;
    }

    // 2. On server, allow rendering (SSR needs to render page shell)
    if (!isPlatformBrowser(platformId)) {
      return true; // ✅ Allow SSR to render
    }

    // 3. On browser, redirect to home
    router.navigate(['/']);
    return false;
  };
};
