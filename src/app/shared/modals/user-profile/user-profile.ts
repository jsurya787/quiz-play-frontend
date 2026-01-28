import {
  Component,
  effect,
  EventEmitter,
  Output,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.html',
})
export class UserProfileModalComponent {

  /* ================= OUTPUT ================= */
  @Output() close = new EventEmitter<void>();

  /* ================= DI (Angular 20 style) ================= */
  private authService = inject(AuthService);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /* ================= STATE ================= */
  userTitle = signal('🎓 Student');
  totalQuizes = signal(0);
  attemptedQuizes = signal(0);

  user = signal<any>(null);

  constructor() {
    /* 🔥 React to auth user changes */
    effect(() => {
      this.user.set(this.authService.userData); // <-- signal read
    });

    /* 🔥 Load stats once component is alive */
    this.loadStats();
  }

  /* ================= DATA LOADERS ================= */
  private loadStats() {
    this.quizService
      .getCountofQuizes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.totalQuizes.set(res.data);
      });

    this.quizService
      .getAttemptedQuizzesCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.attemptedQuizes.set(res.count);
      });
  }

  /* ================= ACTIONS ================= */
  changePassword() {
    this.close.emit();
  }

  logout() {
    this.authService.logout();
    this.close.emit();
    this.router.navigate(['/login']);
  }
}
