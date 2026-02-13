import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean | UrlTree {
    // ✅ APP_INITIALIZER already ran bootstrapAuth()
    
    // 1. If authenticated, redirect away from public pages (login/signup)
    // 2. Only redirect on browser (server doesn't have full auth context)
    if (isPlatformBrowser(this.platformId) && this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/dashboard/all']);
    }
    
    return true;
  }
}


