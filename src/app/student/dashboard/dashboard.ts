import { Component, inject, signal } from '@angular/core';
import { Subject, SubjectService } from '../../services/subject.service';
import { QuizService } from '../../services/quiz.service';
import { AdminRoutingModule } from "../../admin/admin-routing-module";
import { Subject as _sb, debounceTime,  } from 'rxjs';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  templateUrl:'./dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [AdminRoutingModule, CommonModule],
})
export class DashboardComponent {

  private subjectService = inject(SubjectService);
  private quizService = inject(QuizService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  // 🔥 Debounce trigger
  private filterChange$ = new _sb<void>();

  subjects = signal<Subject[]>([]);
  quizess = signal<any[]>([]);
  loading = signal(true); 
  subjectId = signal<string | null>(null);


  // 🔍 FILTER STATE
  search = signal('');
  selectedSubject = signal<string | null>(null);
  difficulty = signal<string | null>(null);
  createdByMe = signal(false);

constructor() {
  this.route.paramMap.subscribe(params => {
    const subjectId = params.get('subjectId');

    if (!subjectId || subjectId === 'all') {
      this.subjectId.set(null);
      this.selectedSubject.set(null);
    } else {
      this.subjectId.set(subjectId);
      this.selectedSubject.set(subjectId);
    }
    if(this.subjectService.subjects().length === 0){
      this.loadSubjects();
    }else{
      this.subjects.set(this.subjectService.subjects());
    }
     this.loadQuizes();
        // ✅ debounce once, globally
    this.filterChange$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.loadQuizes();
      });
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
    this.createdByMe.set(false);
    this.loadQuizes();
  }

  onDeleteQuiz(quizId: string): void {
    alert('Are you sure you want to delete this quiz? This action cannot be undone.');
    this.quizService.deleteQuiz(quizId).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success('Quiz deleted successfully.');
          this.loadQuizes();
        }
      },
      error: err => {
        this.toastService.error('Failed to delete quiz. Please try again later.');
        console.error(err.error?.message || 'Failed to delete quiz');
      }
    });
  }
}
