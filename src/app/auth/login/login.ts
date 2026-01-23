import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
<section
  class="relative min-h-screen flex items-center justify-center
         overflow-hidden px-6
         bg-gradient-to-br from-indigo-100/60 via-white to-sky-100/60">

  <div
    class="w-full max-w-md rounded-2xl
           bg-white/80 backdrop-blur
           p-10 shadow-xl">

    <h2 class="text-3xl font-bold mb-6 text-center text-gray-900">
      Login
    </h2>

    <input class="input mb-4" placeholder="Email / Phone" />
    <input class="input mb-6" placeholder="Password" type="password" />

    <button class="btn-primary w-full mb-6">
      Login
    </button>

    <!-- ✅ GOOGLE LOGIN (SAME TAB, GUARANTEED) -->
    <button
      class="w-full
             flex items-center justify-center gap-3
             border border-gray-300
             rounded-xl py-3
             bg-white hover:bg-gray-50
             shadow-sm transition"
      (click)="loginWithGoogle()">

      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        class="w-5 h-5"
        alt="Google" />

      <span class="font-semibold text-gray-700">
        Continue with Google
      </span>
    </button>

    <p class="text-center text-sm mt-6 text-gray-600">
      New here?
      <a routerLink="/signup" class="text-indigo-600 font-semibold hover:underline">
        Create account
      </a>
    </p>

  </div>
</section>
  `
})
export class LoginComponent {

  constructor(
    private authService: AuthService
  ) {}

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

}
