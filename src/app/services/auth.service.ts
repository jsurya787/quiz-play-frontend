import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environment';
import { endpoints } from '../../endpoints';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken$ = new BehaviorSubject<string | null>(null);
  private authReady$ = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ============================
  // 🔑 GOOGLE LOGIN (REDIRECT)
  // ============================
  loginWithGoogle(): void {
    const params = new URLSearchParams({
      client_id: environment.googleClientId,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    // ✅ Same-tab redirect (SSR-safe)
    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // ============================
  // 🔐 TOKEN MANAGEMENT
  // ============================
  setAccessToken(token: string) {
    this.accessToken$.next(token);
  }

  getAccessToken(): string | null {
    return this.accessToken$.value;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken$.value;
  }

  isReady(): boolean {
    return this.authReady$.value;
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      environment.apiUrl + endpoints.auth.refresh,
      {},
      { withCredentials: true },
    ).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        this.authReady$.next(true);
      })
    );
  }

  bootstrapAuth(): Promise<void> {
    return new Promise(resolve => {
      this.refreshToken().subscribe({
        next: () => resolve(),
        error: () => {
          this.authReady$.next(true);
          resolve();
        },
      });

      // fallback safety
      setTimeout(() => {
        this.authReady$.next(true);
        resolve();
      }, 500);
    });
  }

  logout(): void {
    this.http
      .post(environment.apiUrl + endpoints.auth.logout, {}, {
        withCredentials: true,
      })
      .subscribe({
        complete: () => {
          this.accessToken$.next(null);
          this.router.navigate(['/login']);
        },
      });
  }

}



