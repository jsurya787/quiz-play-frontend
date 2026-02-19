import { Component, inject, signal, OnInit, computed, PLATFORM_ID, Inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast-service';
import { STUDENT_EMAIL_TEMPLATE } from '../../shared/email-templates';
import { ConfirmationModalComponent, ConfirmationType } from '../../shared/modals/confirmation-modal/confirmation-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.scss'
})
export class TeacherDashboardComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private studentSearch$ = new Subject<string>();

  teacherQuizzes = signal<any[]>([]);
  submissions = signal<any[]>([]);
  students = signal<any[]>([]);
  studentSearchTerm = signal('');
  activeTab = signal<'quizzes' | 'submissions' | 'students'>('quizzes');
  loading = signal(true);
  addingStudent = signal(false);
  newStudentEmail = signal('');
  studentEmailTemplate = STUDENT_EMAIL_TEMPLATE;
  confirmModal = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    confirmText: string;
    cancelText: string;
    action?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Remove',
    cancelText: 'Cancel',
  });
  
  // 📊 Raw Stats from API
  totalStudentsCount = signal(0);
  totalSubmissionsCount = signal(0);

  // 📊 Computed Stats
  totalQuizzes = computed(() => this.teacherQuizzes().length);
  totalSubmissions = computed(() => this.totalSubmissionsCount() || this.submissions().length);
  uniqueStudentsCount = computed(() => {
    if (this.totalStudentsCount() > 0) return this.totalStudentsCount();
    const emails = this.submissions().map(s => s.studentEmail).filter(Boolean);
    return new Set(emails).size;
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // 🚫 Skip API calls on server to prevent 401 errors
    if (isPlatformBrowser(this.platformId)) {
      this.setupStudentSearch();
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading.set(true);
    this.loadAllQuizzes(this.authService.currentUser()?.id);
    this.loadSubmissions();
    this.loadStats();
    this.studentSearch$.next(this.studentSearchTerm());
  }

  loadStats() {
    this.teacherService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.totalStudentsCount.set(res.data.totalStudents);
          this.totalSubmissionsCount.set(res.data.totalSubmissions);
        }
      },
      error: (err: any) => console.error('Failed to load teacher stats', err)
    });
  }

  loadAllQuizzes(userId: string) {
    this.teacherService.getQuizzes(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.teacherQuizzes.set(res.data || []);
        if (this.activeTab() === 'quizzes') this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load quizzes');
        this.loading.set(false);
      }
    });
  }

  loadSubmissions() {
    this.teacherService.getSubmissions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.submissions.set(res.data || []);
        if (this.activeTab() === 'submissions') this.loading.set(false);
      },
      error: (err: any) => {
        this.toast.error('Failed to load submissions');
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'quizzes' | 'submissions' | 'students') {
    this.activeTab.set(tab);
    if (tab === 'students' && this.students().length === 0) {
      this.studentSearch$.next(this.studentSearchTerm());
    }
  }

  onStudentSearch(value: string) {
    this.studentSearchTerm.set(value);
    this.studentSearch$.next(value);
  }

  private setupStudentSearch() {
    this.studentSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          this.teacherService.searchAssociatedStudents(term).pipe(
            catchError((err: any) => {
              console.error('Failed to search students', err);
              return of([]);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((students) => {
        this.students.set(students || []);
        if (this.activeTab() === 'students') this.loading.set(false);
      });
  }

  private refreshStudents() {
    this.teacherService
      .searchAssociatedStudents(this.studentSearchTerm())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.students.set(students || []);
          if (this.activeTab() === 'students') this.loading.set(false);
        },
        error: () => {
          if (this.activeTab() === 'students') this.loading.set(false);
        },
      });
  }

  addStudent(email: string) {
    if (!email || !email.includes('@')) {
      this.toast.error('Please enter a valid email');
      return;
    }

    this.addingStudent.set(true);
    this.teacherService.addStudent(email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.toast.success(res?.emailNotice || this.studentEmailTemplate.successToastFallback);
        this.newStudentEmail.set('');
        this.refreshStudents();
        this.loadStats();
        this.addingStudent.set(false);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Failed to add student');
        this.addingStudent.set(false);
      }
    });
  }

  removeStudent(student: any) {
    if (!student?._id) return;
    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'this student';
    this.confirmModal.set({
      isOpen: true,
      title: 'Remove Student',
      message: `Remove ${studentName} from your student list?`,
      type: 'danger',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      action: () => this.executeRemoveStudent(student._id),
    });
  }

  private executeRemoveStudent(studentId: string) {
    this.teacherService
      .removeStudent(studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.toast.success(res?.message || 'Student removed from your list');
          this.refreshStudents();
          this.loadStats();
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message || 'Failed to remove student');
        },
      });
  }

  onConfirmAction() {
    this.confirmModal().action?.();
    this.closeConfirm();
  }

  closeConfirm() {
    this.confirmModal.update((state) => ({ ...state, isOpen: false, action: undefined }));
  }

  editQuiz(quizId: string) {
    this.router.navigate(['/create-quiz-page'], { queryParams: { id: quizId } });
  }

  deleteQuiz(quiz: any) {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      this.teacherService.deleteQuiz(quiz._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.toast.success('Quiz deleted successfully');
          this.loadAllQuizzes(this.authService.currentUser()?.id);
        },
        error: (err: any) => this.toast.error('Failed to delete quiz')
      });
    }
  }

  createNewQuiz() {
    this.router.navigate(['/create-quiz-page']);
  }
}
