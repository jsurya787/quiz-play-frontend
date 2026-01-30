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
  loading = signal<boolean>(true);


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
    if(this.subjectService.subjects().length === 0){
      this.getPrimarySubjects();
    }else{
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

  openEdit(subject: any): void {
    this.isEdit.set(true);
    this.selectedSubject.set(subject);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  // ===============================
  // 🔹 Save Subject
  // ===============================
  saveSubject(payload: any): void {
    if (!this.isEdit()) {
      this.subjectService.createNewSubject(payload).subscribe({
        next: () => {
          this.toastService.success('Subject created successfully.');
          this.getPrimarySubjects(); // refresh list
          this.closeModal();
        },
        error: () => {
          this.toastService.error('Failed to create subject.');
        },
      });
    } else {
      const id = this.selectedSubject()?._id;
      if (!id) return;

      this.subjectService.updateSubject(id, payload).subscribe({
        next: () => {
          this.toastService.success('Subject updated successfully.');
          this.getPrimarySubjects();
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
  getPrimarySubjects(): void {
    this.loading.set(true);
    this.subjectService.getPrimarySubjects().subscribe({
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
