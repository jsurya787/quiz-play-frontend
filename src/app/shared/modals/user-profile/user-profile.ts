import {
  Component,
  effect,
  EventEmitter,
  Output,
  signal,
  computed,
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
  styleUrl: './user-profile.css',
})
export class UserProfileModalComponent {
  
  /* ================= OUTPUT ================= */
  @Output() close = new EventEmitter<void>();
  @Output() changeAccess = new EventEmitter<void>();

  /* ================= DI ================= */
  private authService = inject(AuthService);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /* ================= STATE ================= */
  userTitle = signal('🎓 Student');
  totalQuizes = computed(() => this.quizService.totalQuizzesCount() || 0);
  attemptedQuizes = computed(() => this.quizService.attemptedQuizzesCount() || 0);
  user = signal<any>(null);

  rank = computed(() => {
    const attempts = this.attemptedQuizes(); 
    if (attempts > 50) return 'Grandmaster'; 
    if (attempts > 20) return 'Expert';
    if (attempts > 5) return 'Scholar';
    return 'Novice';
  });

  roleLabel = computed(() => {
    const role = this.user()?.role;
    switch (role) {
      case 'ADMIN': return 'Admin Elite';
      case 'TEACHER': return 'Teacher Elite';
      default: return 'Student Elite';
    }
  });

  constructor() {
    /* 🔥 React to auth user changes */
    effect(() => {
      this.user.set(this.authService.currentUser()); // <-- signal read
    });

    /* 🔥 Load stats once component is alive */
    this.loadStats();
  }

  /* ================= DATA LOADERS ================= */
  private loadStats() {
    if (this.quizService.totalQuizzesCount() !== null) return;

    this.authService
      .getMeDashboardStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.quizService.updateDashboardStats(res?.data || {});
        },
      });
  }

  /* ================= ACTIONS ================= */
  changePassword() {
    this.changeAccess.emit();
  }

  logout() {
    this.authService.logout();
    this.close.emit();
    this.router.navigate(['/login']);
  }

  openMe(tab?: 'created' | 'attempted') {
    this.close.emit();
    this.router.navigate(['/me'], {
      queryParams: tab ? { tab } : undefined,
    });
  }
}
