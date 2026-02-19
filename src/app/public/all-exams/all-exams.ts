import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ExamItem, ExamService, ExamType } from '../../services/exam.service';

@Component({
  selector: 'app-all-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-exams.html',
  styleUrl: './all-exams.scss',
})
export class AllExamsComponent {
  private readonly examService = inject(ExamService);
  private readonly destroy$ = new Subject<void>();
  private readonly fetchTrigger$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  readonly exams = signal<ExamItem[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly selectedType = signal<'all' | ExamType>('all');
  readonly currentPage = signal(1);
  readonly pageSize = 12;
  readonly total = signal(0);
  readonly totalPages = signal(1);

  readonly types = [
    { value: 'all', label: 'All' },
    { value: 'entrance', label: 'Entrance' },
    { value: 'government', label: 'Government' },
    { value: 'state', label: 'State' },
    { value: 'bords', label: 'Boards' },
  ] as const;

  readonly pagedExams = computed(() => this.exams());
  readonly filteredExams = computed(() => this.exams());
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((value) => {
          this.searchTerm.set(value);
          this.currentPage.set(1);
          this.fetchTrigger$.next();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.fetchTrigger$
      .pipe(
        startWith(void 0),
        switchMap(() => this.fetchExams$()),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        this.exams.set(res?.data ?? []);
        this.total.set(res?.pagination?.total ?? 0);
        this.totalPages.set(Math.max(1, res?.pagination?.totalPages ?? 1));

        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  typeLabel(type?: ExamType): string {
    if (!type) return 'General';
    if (type === 'bords') return 'Boards';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  setSearch(value: string): void {
    this.searchInput$.next(value);
  }

  setType(type: 'all' | ExamType): void {
    if (this.selectedType() === type) return;
    this.selectedType.set(type);
    this.currentPage.set(1);
    this.fetchTrigger$.next();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchTrigger$.next();
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  private fetchExams$() {
    if (this.loading()) {
      return of({
        success: true,
        message: 'Loading in progress',
        data: this.exams(),
        pagination: {
          page: this.currentPage(),
          limit: this.pageSize,
          total: this.total(),
          totalPages: this.totalPages(),
        },
      });
    }

    const selectedType = this.selectedType();

    this.loading.set(true);
    return this.examService
      .getExams({
        page: this.currentPage(),
        limit: this.pageSize,
        search: this.searchTerm().trim() || undefined,
        type: selectedType === 'all' ? undefined : selectedType,
      })
      .pipe(
        catchError(() =>
          of({
            success: false,
            message: 'Failed to fetch exams',
            data: [],
            pagination: {
              page: this.currentPage(),
              limit: this.pageSize,
              total: 0,
              totalPages: 1,
            },
          })
        ),
        finalize(() => this.loading.set(false))
      );
  }
}
