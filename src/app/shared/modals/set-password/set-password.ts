import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-set-password-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './set-password.html',
  styleUrls: ['./set-password.css'],
})
export class SetPasswordComponent {
  @Output() close = new EventEmitter<void>();

  password = '';
  confirmPassword = '';

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(private auth: AuthService) {}

  submit() {
    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.setPassword(this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);

        // 🎬 auto close after success animation
        setTimeout(() => this.close.emit(), 1800);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to set password. Try again.');
      },
    });
  }
}
