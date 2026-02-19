import { Inject, Injectable, PLATFORM_ID, TransferState, StateKey, makeStateKey, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { endpoints } from '../../endpoints';
import { isPlatformBrowser } from '@angular/common';
import { catchError, firstValueFrom, tap, EMPTY } from 'rxjs';


const ACCESS_TOKEN_KEY: StateKey<string | null> =
  makeStateKey<string | null>('access-token');


@Injectable({ providedIn: 'root' })
export class AuthService {
  // 🚦 STATE SIGNALS
  accessToken = signal<string | null>(null);
  currentUser = signal<any>(null);
  
  // 🧠 COMPUTED SIGNALS
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  isTeacher = computed(() => this.currentUser()?.role === 'TEACHER');

  private refreshPromise: Promise<void> | null = null;
  private isLoggingOut = false; // 🚫 Flag to block zombie refreshes


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
    this.isLoggingOut = false; // ✅ Reset flag
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
    this.accessToken.set(token);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken();
  }


  refreshToken() {
    if (this.isLoggingOut) {
      return EMPTY; // ✅ Consistent Observable type
    }
    return this.http.post<{ accessToken: string , user: any}>(
      environment.apiUrl + endpoints.auth.refresh,
      {},
      { withCredentials: true },
    ).pipe(
      tap(res => {
        if (this.isLoggingOut) return; // 🛑 Don't restore session if we just logged out
        this.setAccessToken(res.accessToken); 
        this.currentUser.set(res.user);
      }),
    );
  }

  // ============================
  // 🚀 BOOTSTRAP (APP_INITIALIZER)
  // ============================
  // 🔒 Shared Refresh Promise (Singleton Pattern)
  // This ensures multiple guards/interceptors wait for the SAME request
  // private refreshPromise: Promise<void> | null = null; // Defined above

  bootstrapAuth(): Promise<void> {
    // ❌ NEVER refresh on server
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    // 🛑 Block if logging out
    if (this.isLoggingOut) {
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

    // 🔒 Prevent double refresh (Concurrrent calls wait for the same promise)
    if (!this.refreshPromise) {
      this.refreshPromise = firstValueFrom(this.refreshToken())
        .then(() => undefined) // ✅ Success: Token is set by tap() in refreshToken()
        .catch(() => undefined) // ⚠️ Error: Just resolve, guards will check isAuthenticated()
        .finally(() => {
           this.refreshPromise = null; // 🧹 Cleanup after completion
        });
    }

    return this.refreshPromise;
  }


  logout(): void {
    this.isLoggingOut = true; // 🚫 Enable block
    // 🧹 Clear local state immediately (Optimistic)
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.refreshPromise = null; // Clear any pending promise
    this.router.navigate(['/login']);

    // 📞 Call API to invalidate session/cookie (Side effect)
    this.http
      .post(environment.apiUrl + endpoints.auth.logout, {}, {
        withCredentials: true,
      })
      .subscribe({
        complete: () => {
          this.isLoggingOut = false; // ✅ Reset flag on success
        },
        error: (err) => {
          console.error('Logout API failed:', err);
          this.isLoggingOut = false; // ✅ Reset flag even on error
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
  this.isLoggingOut = false; // ✅ Reset flag
  return this.http.post<any>(
    environment.apiUrl + '/auth/login',
    { email, password },
    { withCredentials: true }
  ).pipe(
    tap(res => {this.setAccessToken(res.accessToken); this.currentUser.set(res.user);}),
  );
}

  // ============================
  // 📝 SIGNUP & OTP
  // ============================
  signup(body: any) {
    return this.http.post(
      environment.apiUrl + endpoints.auth.signup,
      body,
      { withCredentials: true }
    ).pipe(
      catchError(err => {
        console.error('Signup API error:', err);
        throw err;
      })
    );
  }


  verifyOtp(email: string, otp: string) {
    return this.http.post<{ accessToken: string; user: any }>(
      environment.apiUrl + endpoints.auth.verifyOtp,
      { email, otp },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        this.currentUser.set(res.user);
      })
    );
  }

  resendOtp(email: string) {
    return this.http.post<{ message: string }>(
      environment.apiUrl + endpoints.auth.resendOtp,
      { email },
      { withCredentials: true }
    );
  }

  forgotPassword(email: string) {
    return this.http.post(
      environment.apiUrl + endpoints.auth.forgotPassword,
      { email },
      { withCredentials: true }
    );
  }

  updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    sex?: 'male' | 'female' | 'other' | null;
    about?: string;
  }) {
    return this.http.patch<{ success: boolean; user: any }>(
      `${environment.apiUrl}/auth/profile`,
      payload,
      { withCredentials: true },
    ).pipe(
      tap((res) => {
        if (res?.user) {
          this.currentUser.update((prev) => ({
            ...(prev || {}),
            ...res.user,
            id: res.user._id || prev?.id,
          }));
        }
      }),
    );
  }

  getMyInstitute() {
    return this.http.get<{ success: boolean; data: any }>(
      `${environment.apiUrl}/teacher/institute`,
      { withCredentials: true },
    );
  }

  updateMyInstitute(payload: {
    name?: string;
    about?: string;
    logo?: string;
  }) {
    return this.http.patch<{ success: boolean; data: any }>(
      `${environment.apiUrl}/teacher/institute`,
      payload,
      { withCredentials: true },
    );
  }

}
