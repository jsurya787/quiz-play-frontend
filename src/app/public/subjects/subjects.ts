import { Component, inject } from '@angular/core';
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
export class SubjectsComponent {
  private subjectService = inject(SubjectService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  primarySubjects: any[] = [];

  constructor() {
    this.getPrimarySubjects();
  }
  // subjects = [
  //   {
  //     name: 'Mathematics',
  //     class: 'Class 10 & 12',
  //     image: 'assets/math.png',
  //     color: 'from-indigo-500 to-purple-600',
  //   },
  //   {
  //     name: 'Physics',
  //     class: 'Class 11 & 12',
  //     image: 'assets/physics.png',
  //     color: 'from-blue-500 to-cyan-500',
  //   },
  //   {
  //     name: 'Chemistry',
  //     class: 'Class 11 & 12',
  //     image: 'assets/chemistry.png',
  //     color: 'from-emerald-500 to-green-600',
  //   },
  // ];

  showModal = false;
  isEdit = false;
  selectedSubject: any = null;

  openAdd() {
    this.isEdit = false;
    this.selectedSubject = null;
    this.showModal = true;
  }

  openEdit(subject: any) {
    this.isEdit = true;
    this.selectedSubject = subject;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSubject(payload: any) {
    if (!this.isEdit) {
      this.subjectService.createNewSubject(payload).subscribe(() => {
        this.toastService.success('Subject created successfully.');
        this.closeModal();
      });
    } else {
      this.subjectService
        .updateSubject(this.selectedSubject._id, payload)
        .subscribe(() => this.closeModal());
    }
  }

  getPrimarySubjects() {
    this.subjectService.getPrimarySubjects().subscribe(
      (res) => {
        this.primarySubjects = res.data;
      },
      (error) => {
        this.toastService.error('Failed to load primary subjects.');
        console.error('Error fetching primary subjects:', error);
      },
    );
  }
}
