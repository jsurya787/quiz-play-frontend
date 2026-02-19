import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { ExamItem, ExamService, ExamType } from '../../services/exam.service';

@Component({
  selector: 'app-trending-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trending-exams.html',
})
export class TrendingExamsComponent {
  private readonly examService = inject(ExamService);

  readonly exams = signal<ExamItem[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.loadTrendingExams();
  }

  typeLabel(type?: ExamType): string {
    if (!type) return 'General';
    if (type === 'bords') return 'Boards';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private loadTrendingExams(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.examService
      .getExams({ page: 1, limit: 3 })
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => this.exams.set(res?.data ?? []),
        error: () => this.exams.set([]),
      });
  }
}
