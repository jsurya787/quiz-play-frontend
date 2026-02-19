import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { ExamItem, ExamService, ExamType } from '../../services/exam.service';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exams.html',
})
export class ExamsComponent {
  private readonly examService = inject(ExamService);

  readonly exams = signal<ExamItem[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly selectedType = signal<'all' | ExamType>('all');
  readonly currentPage = signal(1);
  readonly pageSize = 6;
  readonly total = signal(0);
  readonly totalPages = signal(1);

  readonly hasResults = computed(() => this.exams().length > 0);
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    this.loadExams();
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.loadExams();
  }

  setType(type: 'all' | ExamType): void {
    if (this.selectedType() === type) return;
    this.selectedType.set(type);
    this.currentPage.set(1);
    this.loadExams();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadExams();
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  typeLabel(type?: ExamType): string {
    if (!type) return 'General';
    if (type === 'bords') return 'Boards';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private loadExams(): void {
    if (this.loading()) return;

    this.loading.set(true);
    const selectedType = this.selectedType();
    this.examService
      .getExams({
        page: this.currentPage(),
        limit: this.pageSize,
        search: this.search().trim() || undefined,
        type: selectedType === 'all' ? undefined : selectedType,
      })
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.exams.set(res?.data ?? []);
          this.total.set(res?.pagination?.total ?? 0);
          this.totalPages.set(res?.pagination?.totalPages ?? 1);
          if (this.currentPage() > this.totalPages()) {
            this.currentPage.set(this.totalPages());
          }
        },
        error: () => {
          this.exams.set([]);
          this.total.set(0);
          this.totalPages.set(1);
        },
      });
  }
}
