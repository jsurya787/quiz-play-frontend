import { Inject, Injectable, PLATFORM_ID, TransferState, StateKey, makeStateKey  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { endpoints } from '../../endpoints';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, tap } from 'rxjs';


const ACCESS_TOKEN_KEY: StateKey<string | null> =
  makeStateKey<string | null>('access-token');


@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken$ = new BehaviorSubject<string | null>(null);
  private refreshPromise: Promise<void> | null = null;


  constructor(
    private http: HttpClient,
    private router: Router,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
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


  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      environment.apiUrl + endpoints.auth.refresh,
      {},
      { withCredentials: true },
    ).pipe(
      tap(res => this.setAccessToken(res.accessToken)),
    );
  }

  // ============================
  // 🚀 BOOTSTRAP (APP_INITIALIZER)
  // ============================
bootstrapAuth(): Promise<void> {
  // ❌ NEVER refresh on server
  if (!isPlatformBrowser(this.platformId)) {
    return Promise.resolve();
  }

  // 🚀 FAST PATH: token from SSR
  const tokenFromSSR =
    this.transferState.get(ACCESS_TOKEN_KEY, null);

  if (tokenFromSSR) {
    this.setAccessToken(tokenFromSSR);
    this.transferState.remove(ACCESS_TOKEN_KEY);
    return Promise.resolve();
  }

  // 🔒 Prevent double refresh
  if (!this.refreshPromise) {
    this.refreshPromise = firstValueFrom(
      this.refreshToken()
    )
      .then(() => undefined)   // ✅ FORCE Promise<void>
      .catch(() => {})         // unauth user
      .finally(() => {
        this.refreshPromise = null;
      });
  }

  return this.refreshPromise;
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

  setPassword(password: string) {
    return this.http.post(
      environment.apiUrl + endpoints.auth.setPassword,
      { password },
      { withCredentials: true }
    );
  }

  loginWithPassword(email: string, password: string) {
  return this.http.post<any>(
    environment.apiUrl + '/auth/login',
    { email, password },
    { withCredentials: true }
  ).pipe(
    tap(res => this.setAccessToken(res.accessToken))
  );
}


}



