import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const check = setInterval(() => {
      if (this.authService.isReady()) {
        clearInterval(check);
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      }
    }, 50);
  }

  login(): void {
    this.submitted = true;
    this.error = '';

    if (!this.email || !this.password) {
      return;
    }

    this.loading = true;

    this.authService
      .loginWithPassword(this.email.trim(), this.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error =
            err?.error?.message || 'Invalid email or password';
          this.loading = false;
        },
      });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
