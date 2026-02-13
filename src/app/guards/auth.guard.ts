import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean | UrlTree {
    // ✅ APP_INITIALIZER already ran bootstrapAuth() - no need to call again
    
    // 1. Check if authenticated
    if (this.auth.isAuthenticated()) {
      return true;
    }

    // 2. On server, allow rendering (return true)
    //    SSR needs to render the page shell, even if user isn't authenticated
    //    The client-side will handle the redirect after hydration
    if (!isPlatformBrowser(this.platformId)) {
      return true; // ✅ Allow SSR to render the page
    }

    // 3. On browser, redirect unauthenticated users to login
    return this.router.createUrlTree(['/login']);
  }
}



