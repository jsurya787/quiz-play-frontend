import { Component, inject, signal, OnInit, computed, PLATFORM_ID, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../services/teacher.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.scss'
})
export class TeacherDashboardComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  teacherQuizzes = signal<any[]>([]);
  submissions = signal<any[]>([]);
  students = signal<any[]>([]);
  activeTab = signal<'quizzes' | 'submissions' | 'students'>('quizzes');
  loading = signal(true);
  addingStudent = signal(false);
  newStudentEmail = signal('');
  
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
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading.set(true);
    console.log("user -->", this.authService.currentUser())
    this.loadAllQuizzes(this.authService.currentUser()?.id);
    this.loadSubmissions();
    this.loadStats();
    this.loadStudents();
  }

  loadStats() {
    this.teacherService.getStats().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.totalStudentsCount.set(res.data.totalStudents);
          this.totalSubmissionsCount.set(res.data.totalSubmissions);
        }
      },
      error: (err: any) => console.error('Failed to load teacher stats', err)
    });
  }

  loadAllQuizzes(userrId: string) {
    this.teacherService.getQuizzes(userrId).subscribe({
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
    this.teacherService.getSubmissions().subscribe({
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
      this.loadStudents();
    }
  }

  loadStudents() {
    this.teacherService.getStudents().subscribe({
      next: (res: any) => {
        this.students.set(res || []);
        if (this.activeTab() === 'students') this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load students', err);
        if (this.activeTab() === 'students') this.loading.set(false);
      }
    });
  }

  addStudent(email: string) {
    if (!email || !email.includes('@')) {
      this.toast.error('Please enter a valid email');
      return;
    }

    this.addingStudent.set(true);
    this.teacherService.addStudent(email).subscribe({
      next: (res: any) => {
        this.toast.success('Student added successfully');
        this.newStudentEmail.set('');
        this.loadStudents();
        this.addingStudent.set(false);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Failed to add student');
        this.addingStudent.set(false);
      }
    });
  }

  editQuiz(quizId: string) {
    this.router.navigate(['/create-quiz-page'], { queryParams: { id: quizId } });
  }

  deleteQuiz(quiz: any) {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      this.teacherService.deleteQuiz(quiz._id).subscribe({
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
