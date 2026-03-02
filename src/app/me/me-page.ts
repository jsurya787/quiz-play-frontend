import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../services/auth.service';
import { QuizService } from '../services/quiz.service';
import { QuizPlayerService } from '../services/quiz-player.service';
import { ToastService } from '../services/toast-service';

@Component({
  selector: 'app-me-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './me-page.html',
  styleUrl: './me-page.scss',
})
export class MePageComponent {
  private auth = inject(AuthService);
  private quizService = inject(QuizService);
  private quizPlayerService = inject(QuizPlayerService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  user = signal<any>(null);

  totalQuizzes = computed(() => this.quizService.totalQuizzesCount() || 0);
  attemptedQuizzes = computed(() => this.quizService.attemptedQuizzesCount() || 0);
  createdQuizzesList = computed(() => this.quizService.createdQuizzesList() || []);
  attemptedQuizzesList = signal<any[]>([]);
  loadingList = signal(false);
  loadingDashboard = signal(false);
  activeList = signal<'created' | 'attempted'>('created');
  instituteLoaded = signal(false);

  savingBasic = signal(false);
  savingInstitute = signal(false);

  firstName = signal('');
  lastName = signal('');
  sex = signal<'male' | 'female' | 'other' | ''>('');
  about = signal('');

  instituteName = signal('');
  instituteAbout = signal('');
  instituteLogo = signal('');

  assignedTeachers = signal<any[]>([]);
  loadingTeachers = signal(false);

  isTeacher = computed(() => this.user()?.role === 'TEACHER');

  constructor() {
    effect(() => {
      const u = this.auth.currentUser();
      this.user.set(u);
      this.firstName.set(u?.firstName || '');
      this.lastName.set(u?.lastName || '');
      this.sex.set(u?.sex || '');
      this.about.set(u?.about || '');
      if (u?.role === 'TEACHER' && !this.instituteLoaded()) {
        // Institute details are now loaded via the consolidated dashboard API
      }
      
      if (u?.role === 'STUDENT' && u?.teachers?.length > 0 && this.assignedTeachers().length === 0 && !this.loadingTeachers()) {
        this.loadAssignedTeachers();
      }
    });

    this.loadDashboard();
    const initialTab = this.route.snapshot.queryParamMap.get('tab');
    if (initialTab === 'attempted') {
      this.showAttempted();
    } else {
      this.activeList.set('created');
    }
  }

  private loadDashboard() {
    this.loadingDashboard.set(true);
    this.auth
      .getMeDashboardStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = res?.data || {};
          this.quizService.updateDashboardStats(data);
          
          if (data.instituteDetails) {
            this.instituteName.set(data.instituteDetails.name || '');
            this.instituteAbout.set(data.instituteDetails.about || '');
            this.instituteLogo.set(data.instituteDetails.logo || '');
            this.instituteLoaded.set(true);
          }
          
          this.loadingDashboard.set(false);
        },
        error: () => {
          this.loadingDashboard.set(false);
        },
      });
  }

  showCreated() {
    this.activeList.set('created');
    if (!this.quizService.createdQuizzesList()) this.loadCreatedQuizzes();
  }

  showAttempted() {
    this.activeList.set('attempted');
    if (this.attemptedQuizzesList().length === 0) this.loadAttemptedQuizzes();
  }

  private loadCreatedQuizzes() {
    this.loadingList.set(true);
    this.quizService
      .getCreatedQuizzesList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingList.set(false);
        },
        error: () => {
          this.toast.error('Failed to load created quizzes');
          this.loadingList.set(false);
        },
      });
  }

  private loadAttemptedQuizzes() {
    this.loadingList.set(true);
    this.quizPlayerService
      .getAttemptedQuizzes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.attemptedQuizzesList.set(res?.data || []);
          this.loadingList.set(false);
        },
        error: () => {
          this.toast.error('Failed to load attempted quizzes');
          this.loadingList.set(false);
        },
      });
  }

  private loadAssignedTeachers() {
    this.loadingTeachers.set(true);
    this.auth.getAssignedTeachers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.assignedTeachers.set(res || []);
          this.loadingTeachers.set(false);
        },
        error: () => {
          this.toast.error('Failed to load assigned teachers');
          this.loadingTeachers.set(false);
        }
      });
  }

  saveBasicProfile() {
    this.savingBasic.set(true);
    this.auth
      .updateProfile({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        sex: this.sex() || null,
        about: this.about().trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Profile updated');
          this.savingBasic.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Failed to update profile');
          this.savingBasic.set(false);
        },
      });
  }

  private loadInstitute() {
    // Redundant - handled by loadDashboard()
  }

  saveInstitute() {
    if (!this.isTeacher()) return;
    this.savingInstitute.set(true);
    this.auth
      .updateMyInstitute({
        name: this.instituteName().trim(),
        about: this.instituteAbout().trim(),
        logo: this.instituteLogo().trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Institute updated');
          this.savingInstitute.set(false);
        },
        error: (err) => {
          this.toast.error(err?.error?.message || 'Failed to update institute');
          this.savingInstitute.set(false);
        },
      });
  }
}
