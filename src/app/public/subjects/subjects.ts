import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap, take, throwError } from 'rxjs';

import { CreateSubjectPayload, Subject, SubjectService, UpdateSubjectPayload } from '../../services/subject.service';
import { SubjectFormModalComponent } from '../../shared/modals/subject-form-modal/subject-form-modal';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast-service';
import { CloudinaryService } from '../../services/cloudinary.service';

interface SubjectItem extends Subject {
  subjectClass?: string;
  keyPoints?: string[];
  logoUrl?: string;
  color?: string;
}

interface SubjectFormPayload {
  name: string;
  type: 'entrance' | 'government' | 'state' | 'bords';
  priority: number;
  subjectClass: string;
  description: string;
  keyPoints: string[];
  isPrimary: boolean;
  isActive: boolean;
  logoFile?: File | null;
}

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, RouterLink, SubjectFormModalComponent],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class SubjectsComponent implements OnInit, AfterViewInit {
  public readonly subjectService = inject(SubjectService);
  public readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly cloudinaryService = inject(CloudinaryService);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly showModal = signal(false);
  readonly isEdit = signal(false);
  readonly selectedSubject = signal<SubjectItem | null>(null);
  readonly evenCanScrollLeft = signal(false);
  readonly evenCanScrollRight = signal(false);
  readonly oddCanScrollLeft = signal(false);
  readonly oddCanScrollRight = signal(false);

  @ViewChild('evenRow') private evenRow?: ElementRef<HTMLDivElement>;
  @ViewChild('oddRow') private oddRow?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    if (this.subjectService.subjects().length === 0) {
      this.getSubjects();
      return;
    }

    setTimeout(() => this.refreshMobileArrowState(), 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.refreshMobileArrowState(), 0);
  }

  openAdd(): void {
    this.isEdit.set(false);
    this.selectedSubject.set(null);
    this.showModal.set(true);
  }

  editSubject(subject: SubjectItem): void {
    this.isEdit.set(true);
    this.selectedSubject.set(subject);
    this.showModal.set(true);
  }

  deleteSubject(subject: SubjectItem): void {
    const id = subject?._id;
    if (!id || this.deletingId() === id) return;

    this.deletingId.set(id);

    this.subjectService.deleteSubject(id).pipe(
      take(1),
      finalize(() => this.deletingId.set(null))
    ).subscribe({
      next: () => {
        this.toastService.success('Subject deleted successfully.');
        this.getSubjects();
      },
      error: () => {
        this.toastService.error('Failed to delete subject.');
      },
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveSubject(payload: SubjectFormPayload): void {
    if (this.submitting()) return;

    this.submitting.set(true);

    const uploadLogo$: Observable<string | null> = payload.logoFile
      ? this.cloudinaryService
          .uploadImage(payload.logoFile, 'subjects')
          .pipe(map((r) => r.url))
      : of(null);

    uploadLogo$
      .pipe(
        switchMap((uploadedLogoUrl) => {
          if (!this.isEdit()) {
            const logoUrl = uploadedLogoUrl;
            if (!logoUrl) {
              return throwError(() => new Error('Logo upload is required'));
            }

            const body: CreateSubjectPayload = {
              name: payload.name,
              type: payload.type,
              priority: payload.priority,
              subjectClass: payload.subjectClass,
              description: payload.description,
              keyPoints: payload.keyPoints,
              isPrimary: payload.isPrimary,
              isActive: payload.isActive,
              logoUrl,
            };

            return this.subjectService.createNewSubject(body);
          }

          const id = this.selectedSubject()?._id;
          if (!id) {
            return throwError(() => new Error('Missing subject id'));
          }

          const body: UpdateSubjectPayload = {
            name: payload.name,
            type: payload.type,
            priority: payload.priority,
            subjectClass: payload.subjectClass,
            description: payload.description,
            keyPoints: payload.keyPoints,
            isPrimary: payload.isPrimary,
            isActive: payload.isActive,
            ...(uploadedLogoUrl ? { logoUrl: uploadedLogoUrl } : {}),
          };

          return this.subjectService.updateSubject(id, body);
        }),
        take(1),
        finalize(() => this.submitting.set(false)),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            this.isEdit() ? 'Subject updated successfully.' : 'Subject created successfully.',
          );
          this.getSubjects();
          this.closeModal();
        },
        error: () => {
          this.toastService.error(
            this.isEdit() ? 'Failed to update subject.' : 'Failed to create subject.',
          );
        },
      });
  }

  getSubjects(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.subjectService.loadPrimarySubjects().pipe(
      take(1),
      finalize(() => {
        this.loading.set(false);
        setTimeout(() => this.refreshMobileArrowState(), 0);
      })
    ).subscribe({
      next: (subjects) => {
        this.subjectService.subjects.set(subjects);
      },
      error: (err) => {
        console.error('Error fetching primary subjects:', err);
        this.toastService.error('Failed to load primary subjects.');
        this.subjectService.subjects.set([]);
      },
    });
  }

  onRowScroll(row: 'even' | 'odd', event: Event): void {
    const target = event.target as HTMLDivElement | null;
    if (!target) return;
    this.updateScrollState(row, target);
  }

  scrollRow(row: 'even' | 'odd', direction: 'left' | 'right'): void {
    const el = row === 'even' ? this.evenRow?.nativeElement : this.oddRow?.nativeElement;
    if (!el) return;

    const step = Math.max(180, Math.floor(el.clientWidth * 0.82));
    const delta = direction === 'left' ? -step : step;

    el.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(row, el), 220);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.refreshMobileArrowState();
  }

  private refreshMobileArrowState(): void {
    this.updateScrollState('even', this.evenRow?.nativeElement);
    this.updateScrollState('odd', this.oddRow?.nativeElement);
  }

  private updateScrollState(
    row: 'even' | 'odd',
    el?: HTMLDivElement
  ): void {
    if (!el) {
      if (row === 'even') {
        this.evenCanScrollLeft.set(false);
        this.evenCanScrollRight.set(false);
      } else {
        this.oddCanScrollLeft.set(false);
        this.oddCanScrollRight.set(false);
      }
      return;
    }

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const canLeft = el.scrollLeft > 4;
    const canRight = maxScrollLeft - el.scrollLeft > 4;

    if (row === 'even') {
      this.evenCanScrollLeft.set(canLeft);
      this.evenCanScrollRight.set(canRight);
      return;
    }

    this.oddCanScrollLeft.set(canLeft);
    this.oddCanScrollRight.set(canRight);
  }

  // FormData no longer needed — images upload directly to Cloudinary
}
