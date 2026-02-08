import { Component, ElementRef, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast-service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  
  step = signal<'login' | 'fpassword' | 'otp' | 'reset-password'>('login');
  loading = false;
  error = signal<string | null>(null);
  submitted = false;

  @ViewChildren('otpInputs') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  get f() { return this.loginForm.controls; }
  get fp() { return this.forgotPasswordForm.controls; }
  get fr() { return this.resetPasswordForm.controls; }

  login(): void {
    this.submitted = true;
    this.error.set(null); 

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService
      .loginWithPassword(email.trim(), password)
      .subscribe({
        next: () => {
          this.router.navigate(['/login-success']);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Invalid email or password'
          );
          this.loading = false;
        },
      });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  // ============================
  // 🔑 FORGOT PASSWORD FLOW
  // ============================
  
  switchStep(newStep: 'login' | 'fpassword' | 'otp' | 'reset-password'): void {
    this.step.set(newStep);
    this.error.set(null);
    this.submitted = false;
    this.loading = false;
  }

  onForgotPasswordSubmit(): void {
    this.submitted = true;
    this.error.set(null);

    if (this.forgotPasswordForm.invalid) return;

    this.loading = true;
    const email = this.forgotPasswordForm.value.email;
    
    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        if(res.success){
          this.loading = false;
          this.toast.success(res.message);
          this.switchStep('otp');
        }else{
          this.loading = false;
          this.toast.error(res.message);
          this.error.set(res.message);
        }
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error sending reset email'); 
        this.error.set(err?.error?.message || 'Error sending reset email');
        this.loading = false;
      }
    });
  }

  // --- OTP HANDLERS (Robust version) ---
  otpDigits: string[] = ['', '', '', '', '', ''];
  
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
    this.error.set(null);

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
      this.error.set('Please enter 6 digits');
      this.toast.error('Please enter 6 digits');
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email;
    this.authService.verifyOtp(email, otp).subscribe({
      next: (res: any) => {
        if(res?.success){
          this.loading = false;
          this.toast.success(res.message);
          this.switchStep('reset-password');
        }else{
          this.loading = false;
          this.toast.error(res.message);
          this.error.set(res.message);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Invalid OTP');
        this.loading = false;
        // Clear OTP inputs on error for security/better UX
        this.otpDigits = ['', '', '', '', '', ''];
        this.focusOtpInput(0);
      }
    });
  }

  onResetPasswordSubmit(): void {
    this.submitted = true;
    this.error.set(null);

    if (this.resetPasswordForm.invalid) return;

    this.loading = true;
    const password = this.resetPasswordForm.value.password;
    
    this.authService.setPassword(password).subscribe({
      next: (res: any) => {
        if(res.success){
          this.toast.success(res.message);
          this.loading = false;
         // this.switchStep('login');
          this.router.navigate(['/']);
        }else{
          this.toast.error(res.message);
          this.error.set(res.message);
          this.loading = false;
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error resetting password');
        this.loading = false;
      }
    });
  }
}
