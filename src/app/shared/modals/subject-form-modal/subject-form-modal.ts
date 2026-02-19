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
// 🔹 Image State
  logoFile = signal<File | null>(null);
  logoPreview = signal<string | null>(null);

  keyPoints: string[] = [];
  keyPoint = '';

  // 🔹 Validation flags
  showErrors = signal(false);

  form;

  constructor(private fb: NonNullableFormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      priority: [0, [Validators.required, Validators.min(0)]],
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
          type: s.type ?? '',
          priority: s.priority ?? 0,
          subjectClass: s.subjectClass ?? '',
          description: s.description ?? '',
          isPrimary: s.isPrimary ?? false,
          isActive: s.isActive ?? true,
        });
        this.keyPoints = [...(s.keyPoints || [])];

        // 🔹 Existing logo (edit mode)
        this.logoPreview.set(s.logoUrl ?? null);
        this.logoFile.set(null);
      } else {
        this.form.reset({
          name: '',
          type: '',
          priority: 0,
          subjectClass: '',
          description: '',
          isPrimary: false,
          isActive: true,
        });

        this.keyPoints = [];
        this.logoPreview.set(null);
        this.logoFile.set(null);
      }

      this.showErrors.set(false);
    });

  }

  onLogoSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;

  const file = input.files[0];
  this.logoFile.set(file);

  // Preview
  const reader = new FileReader();
  reader.onload = () => {
    this.logoPreview.set(reader.result as string);
  };
  reader.readAsDataURL(file);
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
    return this.keyPoints.length >= 3;
  }

  // 🔹 Submit
  submit(): void {
    this.showErrors.set(true);

    if (
      this.form.invalid ||
      !this.hasMinKeyPoints ||
      (!this.logoFile() && !this.isEdit())
    ) {
      return;
    }

    this.submitForm.emit({
      ...this.form.getRawValue(),
      keyPoints: this.keyPoints,
      logoFile: this.logoFile(), // 🔹 important
    });
  }


  close(): void {
    this.form.reset({
      name: '',
      type: '',
      priority: 0,
      subjectClass: '',
      description: '',
      isPrimary: false,
      isActive: true,
    });

    this.keyPoints = [];
    this.logoFile.set(null);
    this.logoPreview.set(null);

    this.closeModal.emit();
  }

}
