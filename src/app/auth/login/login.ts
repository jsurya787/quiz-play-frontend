import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const google: any;

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
      <div class="mt-6">
        <div id="googleBtn"></div>
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
    private router: Router,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id:
        '258326031404-hdqc40qajfvrlvi6v85ua8la1ncds6fe.apps.googleusercontent.com',
      callback: (response: any) => {
        this.handleGoogleLogin(response.credential);
      },
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'outline',
        size: 'large',
        width: 320,
      }
    );
  }

  handleGoogleLogin(idToken: string) {
    this.http
      .post('http://localhost:3000/auth/google', {
        idToken,
      })
      .subscribe({
        next: (res: any) => {
          // store JWT (for now localStorage; later HttpOnly cookie)
          localStorage.setItem('accessToken', res.accessToken);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Google login failed', err);
        },
      });
  }

  login() {
    this.router.navigate(['/dashboard']);
  }
}
