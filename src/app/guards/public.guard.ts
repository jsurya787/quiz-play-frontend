import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isAuthenticated()) {
      // ✅ RETURN UrlTree instead of navigate()
      return this.router.createUrlTree(['/dashboard']);
    }
    return true;
  }
}


