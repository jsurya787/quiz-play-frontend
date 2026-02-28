import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environment';
import { endpoints } from '../../../endpoints';
import { timeout } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-6">
      <div
        class="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"
        *ngIf="!error">
      </div>
      <p class="mt-4 text-lg text-gray-700 text-center">{{ statusMessage }}</p>
      <button
        *ngIf="error"
        class="btn-primary mt-6"
        (click)="goLogin()">
        Back to login
      </button>
    </div>
  `,
})
export class GoogleCallbackComponent implements OnInit {
  statusMessage = 'Signing you in…';
  error = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {

    // 🚫 NEVER run OAuth logic on server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      this.router.navigate(['/login']);
      return;
    }

    // add timeout so user isn't stuck indefinitely
    this.http.post<any>(
      environment.apiUrl + endpoints.auth.loginWithGoogle,
      { code },
      { withCredentials: true } // 🔥 cookie must be set in browser
    )
    .pipe(
      // fail after 30s, show message
      timeout(30000)
    )
    .subscribe({
      next: (res) => {
        this.auth.currentUser.set(res.user);
        this.auth.setAccessToken(res.accessToken);
       // this.router.navigate(['/dashboard']);
       this.router.navigate(['/login-success']);
      },
      error: (err) => {
        console.error('OAuth failed:', err);
        this.statusMessage = 'Something went wrong. Please try again.';
        this.error = true;
      },
    });
  }
}
