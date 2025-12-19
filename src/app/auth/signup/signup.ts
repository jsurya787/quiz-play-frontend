import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">

      <h2 class="text-3xl font-bold mb-6 text-center">Sign Up</h2>

      <input class="input" placeholder="Name" />
      <input class="input mt-4" placeholder="Email" />
      <input class="input mt-4" placeholder="Password" type="password"/>

      <button
        class="btn-primary w-full mt-6"
        (click)="signup()">
        Create Account
      </button>

    </div>
  </section>
  `
})
export class SignupComponent {
  constructor(private router: Router) {}
  signup() {
    this.router.navigate(['/dashboard']);
  }
}
