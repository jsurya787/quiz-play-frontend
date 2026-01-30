import { Component, inject, signal } from '@angular/core';
import { Subject, SubjectService } from '../../services/subject.service';
import { QuizService } from '../../services/quiz.service';
import { AdminRoutingModule } from "../../admin/admin-routing-module";
import { debounceTime, Subject as _sb,  } from 'rxjs';
import { ToastService } from '../../services/toast-service';

@Component({
  standalone: true,
  templateUrl:'./dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [AdminRoutingModule],
})
export class DashboardComponent {

  private subjectService = inject(SubjectService);
  private quizService = inject(QuizService);
  private toastService = inject(ToastService);
  // 🔥 Debounce trigger
  private filterChange$ = new _sb<void>();

  subjects = signal<Subject[]>([]);
  quizess = signal<any[]>([]);
  loading = signal(true);

  // 🔍 FILTER STATE
  search = signal('');
  selectedSubject = signal<string | null>(null);
  difficulty = signal<string | null>(null);

  constructor() {
    this.loadSubjects();
    this.loadQuizes();

    // ✅ debounce once, globally
    this.filterChange$
      .pipe(debounceTime(500))
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
    this.selectedSubject.set(null);
    this.difficulty.set(null);
    this.loadQuizes();
  }
}
