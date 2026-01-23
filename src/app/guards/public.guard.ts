import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { filter, map, Observable, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}

