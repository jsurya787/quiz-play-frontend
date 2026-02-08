import { Component, ElementRef, QueryList, signal, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // UI state
  step = signal<'form' | 'otp'>('form');
  loading = false;
  submitted = false;
  error = signal<string | null>(null);

  // OTP state
  otpDigits: string[] = ['', '', '', '', '', ''];
  verifying = false;
  otpError = signal<string | null>(null);
  resending = false;
  resendCooldown = 0;

  @ViewChildren('otpInputs') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
   // this.step = 'form';
    console.log("called :::::")
  }

  // ============================
  // 📝 SIGNUP
  // ============================
  signup(): void {
    this.submitted = true;
    this.error.set(null);

    // Validation
    if (!this.email) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading = true;
    this.authService.signup(this.getsinedUserRequesbody()).subscribe({
      next: () => {
        this.loading = false;
        this.step.set('otp');
        this.startResendCooldown();
        setTimeout(() => this.focusOtpInput(0), 100);
      },
      error: (err) => {
        console.log("first", err?.error?.message)
        this.error.set(err?.error?.message || 'Something went wrong. Please try again.');
        this.loading = false;
      }
    });

  }

  private getsinedUserRequesbody(){
    return {
      email: this.email.trim(),
      password: this.password.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    }
  }

  signupWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  // ============================
  // 🔢 OTP HANDLING
  // ============================
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otpDigits[index] = '';
      return;
    }

    this.otpDigits[index] = value;
    this.otpError.set(null);

    // Auto-focus next input
    if (value && index < 5) {
      this.focusOtpInput(index + 1);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    // Handle backspace
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.focusOtpInput(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = digits[i] || '';
    }

    // Focus last filled input or first empty
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    this.focusOtpInput(lastFilledIndex);
  }

  private focusOtpInput(index: number): void {
    const inputs = this.otpInputs?.toArray();
    if (inputs && inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  verifyOtp(): void {
    const otp = this.otpDigits.join('');

    if (otp.length !== 6) {
      this.otpError.set('Please enter all 6 digits');
      return;
    }

    this.verifying = true;
    this.otpError.set(null);

    this.authService.verifyOtp(this.email, otp).subscribe({
      next: () => {
        this.router.navigate(['/login-success']);
      },
      error: (err) => {
        this.otpError.set(err?.error?.message || 'Invalid OTP. Please try again.');
        this.verifying = false;
        // Clear OTP inputs
        this.otpDigits = ['', '', '', '', '', ''];
        this.focusOtpInput(0);
      }
    });
  }

  resendOtp(): void {
    this.resending = true;

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.resending = false;
        this.startResendCooldown();
      },
      error: () => {
        this.resending = false;
        this.otpError.set('Failed to resend code. Please try again.');
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }
}
