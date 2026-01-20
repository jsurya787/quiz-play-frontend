import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environment';
import { endpoints } from '../../../endpoints';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">

      <h2 class="text-3xl font-bold mb-6 text-center">Login</h2>

      <input class="input" placeholder="Email" />
      <input class="input mt-4" placeholder="Password" type="password"/>

      <button
        class="btn-primary w-full mt-6"
        (click)="login()">
        Login
      </button>

      <!-- GOOGLE LOGIN BUTTON -->
      <div class="mt-6 flex justify-center">
        <div id="googleBtn" class="w-full flex justify-center"></div>
      </div>

      <p class="text-center text-sm mt-4">
        New here?
        <a routerLink="/signup" class="text-indigo-600 font-semibold">
          Create account
        </a>
      </p>

    </div>
  </section>
  `
})
export class LoginComponent implements AfterViewInit {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.authService.initGoogleLogin(
      environment.googleClientId,
      (response: any) => {
        this.onGoogleLogin(response.credential);
      }
    );

    this.authService.renderButton('googleBtn');
  }

  private onGoogleLogin(idToken: string): void {
    this.http
      .post(environment.apiUrl + endpoints.auth.loginWithGoogle, { idToken })
      .subscribe({
        next: (res: any) => {
          console.log('res ====>', res);
          this.authService.storeToken(res.accessToken);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Google login failed', err);
          alert(err?.error?.message || 'Google login failed');
        },
      });
  }

  login(): void {
    this.router.navigate(['/dashboard']);
  }
}
