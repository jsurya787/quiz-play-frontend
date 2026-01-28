import { Component, effect, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subject-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './subject-form-modal.html',
})
export class SubjectFormModalComponent {
  // 🔹 Signals
  visible = input<boolean>(false);
  isEdit = input<boolean>(false);
  subject = input<any | null>(null);

  // 🔹 Outputs
  closeModal = output<void>();
  submitForm = output<any>();

  keyPoints: string[] = [];
  keyPoint = '';

  // 🔹 Validation flags
  showErrors = signal(false);

  form;

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      subjectClass: ['', Validators.required],
      description: ['', Validators.required],
      isPrimary: [false],
      isActive: [true],
    });

    // React to edit / add mode
    effect(() => {
      const s = this.subject();

      if (s) {
        this.form.reset({
          name: s.name ?? '',
          subjectClass: s.subjectClass ?? '',
          description: s.description ?? '',
          isPrimary: s.isPrimary ?? false,
          isActive: s.isActive ?? true,
        });
        this.keyPoints = [...(s.keyPoints || [])];
      } else {
        this.form.reset({
          name: '',
          subjectClass: '',
          description: '',
          isPrimary: false,
          isActive: true,
        });
        this.keyPoints = [];
      }

      this.showErrors.set(false);
    });
  }

  // 🔹 Key points
  addKeyPoint(): void {
    if (!this.keyPoint.trim()) return;

    this.keyPoints.push(this.keyPoint.trim());
    this.keyPoint = '';
  }

  removeKeyPoint(index: number): void {
    this.keyPoints.splice(index, 1);
  }

  // 🔹 Validation helpers
  get hasMinKeyPoints(): boolean {
    return this.keyPoints.length >= 4;
  }

  // 🔹 Submit
  submit(): void {
    this.showErrors.set(true);

    if (this.form.invalid || !this.hasMinKeyPoints) {
      return;
    }

    this.submitForm.emit({
      ...this.form.getRawValue(),
      keyPoints: this.keyPoints,
    });
  }

  close(): void {
    this.form.reset({
      name: '',
      subjectClass: '',
      description: '',
      isPrimary: false,
      isActive: true,
    });
    this.keyPoints = [];
    this.closeModal.emit();
  }
}
