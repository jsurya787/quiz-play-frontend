import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SubjectService } from '../../services/subject.service';
import { SubjectFormModalComponent } from '../../shared/modals/subject-form-modal/subject-form-modal';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, RouterLink, SubjectFormModalComponent],
  templateUrl: './subjects.html',
})
export class SubjectsComponent implements OnInit {
  // ===============================
  // 🔹 Injected Services
  // ===============================
  public subjectService = inject(SubjectService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);

  // ===============================
  // 🔹 State (Signals)
  // ===============================
  loading = signal<boolean>(false);

  // ===============================
  // 🔹 Modal State
  // ===============================
  showModal = signal(false);
  isEdit = signal(false);
  selectedSubject = signal<any | null>(null);

  // ===============================
  // 🔹 Lifecycle
  // ===============================
  ngOnInit(): void {
    if (this.subjectService.subjects().length === 0) {
      this.getSubjects();
    } else {
      this.loading.set(false);
    }
  }

  // ===============================
  // 🔹 Modal Actions
  // ===============================
  openAdd(): void {
    this.isEdit.set(false);
    this.selectedSubject.set(null);
    this.showModal.set(true);
  }

  editSubject(subject: any): void {
    this.isEdit.set(true);
    this.selectedSubject.set(subject);
    this.showModal.set(true);
  }

  deleteSubject(subject: any): void {
    const id = subject?._id;
    if (!id) return;

    this.subjectService.deleteSubject(id).subscribe({
      next: () => {
        this.toastService.success('Subject deleted successfully.');
        this.getSubjects(); // refresh list
      },
      error: () => {
        this.toastService.error('Failed to delete subject.');
      },
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  // ===============================
  // 🔹 Save Subject
  // ===============================
  saveSubject(payload: any): void {
    const fd: any = new FormData();

    // 🔹 Common fields
    fd.append('name', payload.name);
    fd.append('subjectClass', payload.subjectClass);
    fd.append('description', payload.description);
    fd.append('keyPoints', JSON.stringify(payload.keyPoints));
    fd.append('isPrimary', String(payload.isPrimary));
    fd.append('isActive', String(payload.isActive));

    // 🔹 Logo (only if selected)
    if (payload.logoFile) {
      fd.append('logo', payload.logoFile);
    }

    if (!this.isEdit()) {
      // ➕ CREATE
      this.subjectService.createNewSubject(fd).subscribe({
        next: () => {
          this.toastService.success('Subject created successfully.');
          this.getSubjects(); // refresh list
          this.closeModal();
        },
        error: () => {
          this.toastService.error('Failed to create subject.');
        },
      });
    } else {
      // ✏️ UPDATE
      const id = this.selectedSubject()?._id;
      if (!id) return;

      this.subjectService.updateSubject(id, fd).subscribe({
        next: () => {
          this.toastService.success('Subject updated successfully.');
          this.getSubjects();
          this.closeModal();
        },
        error: () => {
          this.toastService.error('Failed to update subject.');
        },
      });
    }
  }

  // ===============================
  // 🔹 Load Subjects
  // ===============================
  getSubjects(): void {
    this.loading.set(true);
    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        this.subjectService.subjects.set(res?.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching primary subjects:', err);
        this.toastService.error('Failed to load primary subjects.');
        this.subjectService.subjects.set([]);
        this.loading.set(false);
      },
    });
  }
}
