import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, SubjectService } from '../../services/subject.service';
import { QuizService } from '../../services/quiz.service';
import { AdminRoutingModule } from "../../admin/admin-routing-module";
import { Subject as _sb, debounceTime,  } from 'rxjs';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  templateUrl:'./dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [AdminRoutingModule, CommonModule, FormsModule],
})
export class DashboardComponent {

  private destroyRef = inject(DestroyRef);
  // 🔥 Debounce trigger
  private filterChange$ = new _sb<void>();

  subjects = signal<Subject[]>([]);
  quizess = signal<any[]>([]);
  loading = signal(true); 
  subjectId = signal<string | null>(null);


  // 🔍 FILTER STATE
  search = signal('');
  selectedSubject = signal<string>('');
  difficulty = signal<string>('');
  createdByMe = signal(false);
  teacherQuizzesOnly = signal(false);

  constructor(
    private subjectService: SubjectService,
    private quizService: QuizService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        this.loading.set(true);
        const subjectId = params.get('subjectId');
        console.log('--- DASHBOARD NAV ---');
        console.log('Route subjectId:', subjectId);

        if (!subjectId || subjectId === 'all') {
          this.subjectId.set(null);
          this.selectedSubject.set('');
        } else {
          this.subjectId.set(subjectId);
          this.selectedSubject.set(subjectId);
        }
        
        console.log('Signals set:', {
          subjectId: this.subjectId(),
          selectedSubject: this.selectedSubject()
        });

        if (this.subjectService.subjects().length === 0) {
          this.loadSubjects();
        } else {
          console.log('Using cached subjects from service:', this.subjectService.subjects().length);
          this.subjects.set(this.subjectService.subjects());
        }
        
        this.loadQuizes();
      });

    // ✅ debounce once, globally (outside paramMap subscribe)
    this.filterChange$
      .pipe(
        debounceTime(500),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.loadQuizes();
      });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: res => {
        if (res.success) {
          this.subjects.set(res.data);
        }
      },
      error: err =>
        console.error(err.error?.message || 'Failed to load subjects'),
    });
  }

  loadQuizes(): void {
    this.quizService.getQuizes({
      search: this.search(),
      subjectId: this.selectedSubject(),
      difficulty: this.difficulty(),
      createdByMe: this.createdByMe(),
      teacherQuizzesOnly: this.teacherQuizzesOnly(),
    }).subscribe({
      next: res => {
        if (res.success) {
          this.quizess.set(res.data);
          this.loading.set(false);
        }
      },
      error: err => {
        this.loading.set(false);
        this.toastService.error('Failed to load quizzes. Please try again later.');
        console.error(err.error?.message || 'Failed to load quizzes');
      }
    });
  }

  // 🔁 CALL WHEN FILTERS CHANGE
  applyFilters(): void {
    this.filterChange$.next();
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedSubject.set('');
    this.difficulty.set('');
    this.createdByMe.set(false);
    this.teacherQuizzesOnly.set(false);
    
    // Check if we are already on the 'all' route
    if (this.router.url === '/dashboard/all') {
      this.loadQuizes();
    } else {
      // Primary action: trigger navigation which then triggers the subscription to reload
      this.router.navigate(['/dashboard/all']);
    }
  }

  onDeleteQuiz(quizId: string): void {
    if(!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    
    this.quizService.deleteQuiz(quizId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Quiz deleted successfully.');
          this.loadQuizes();
        }
      },
      error: (err) => {
        this.toastService.error('Failed to delete quiz. Please try again later.');
        console.error(err);
      }
    });
  }

  onEditQuiz(quizId: string) {
     this.router.navigate(['/create-quiz-page'], { queryParams: { id: quizId } });
  } 
}
