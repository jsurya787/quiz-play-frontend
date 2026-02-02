import { Component, computed, signal, inject } from '@angular/core';
import {
  FormArray,
  Validators,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { QuizService } from '../services/quiz.service';
  import { SubjectService, Subject } from '../services/subject.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast-service';
import { RetryAttemptService } from '../services/retry-attempt-service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-quiz-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-quiz-page.html',
  styleUrl: './create-quiz-page.css',
})
export class CreateQuizPage {
  private fb = inject(NonNullableFormBuilder);
  private quizService = inject(QuizService);
  private subjectService = inject(SubjectService);
  private toast = inject(ToastService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private _retryAttemptService = inject(RetryAttemptService);

  // 🔢 marks per question
  marks = signal(4);
  editingQuestionId = signal<string | null>(null);
  showBulkPopup = signal(false);
  bulkText = '';



  /* ===============================
     STATE (SIGNALS)
  ================================ */

  quizId = signal<string | null>(null);
  questions = signal<any[]>([]);
  totalMarks = signal<number>(0);
  subjects = signal<Subject[]>([]);

  questionCount = computed(() => this.questions().length);

  constructor() {
  this.loadSubjects();
  }

  /* ===============================
     FORMS (NON-NULLABLE ✔)
  ================================ */

  quizForm = this.fb.group({
    title: ['', Validators.required], 
    description: ['', Validators.required],
    subjectId: ['', Validators.required],
    difficulty: ['easy', Validators.required],
    timeLimit: [10, [Validators.required, Validators.min(1)]],
  });

  questionForm = this.fb.group({
    questionText: ['', Validators.required],
    marks: [4, [Validators.required, Validators.min(1)]],
    options: this.fb.array(
      Array.from({ length: 4 }).map(() =>
        this.fb.group({
          text: ['', Validators.required],
          isCorrect: false,
        }),
      ),
    ),
  });

  get options(): FormArray {
    return this.questionForm.controls.options as FormArray;
  }

  /* ===============================
     ACTIONS
  ================================ */


loadSubjects(): void {
  this._retryAttemptService.resetAll();
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


isDraftSaved(): boolean {
  return this.quizId() !== null;
}

saveDraft(): void {
  if(!this.authService.isAuthenticated() && !this._retryAttemptService.canCreate()) {
      this.toast.info('Quiz creation limit reached. Log in with Google to continue OR try again after 24 hours.', 4000);
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 4500);
      return;
  }
  if (this.quizForm.invalid){
    this.quizForm.markAllAsTouched();
    this.quizForm.markAllAsDirty();
    this.toast.warning('Please fill all the fields');
    return;
  } 

  if(this.isDraftSaved()){
    // 🔥 UPDATE DRAFT
    this.quizService
    .updarteQuiz(this.quizId()!, this.quizForm.value as any)
    .subscribe({
      next: res => {
        this.toast.success('Quiz draft updated');
       // alert('Quiz draft created');
      },
      error: err =>
        this.toast.error(err.error?.message || 'Failed to update quiz'),
       // alert(err.error?.message || 'Failed to create quiz'),
    });
    return;
  }
  // ➕ CREATE DRAFT
  this.quizService
    .createQuiz(this.quizForm.value as any)
    .subscribe({
      next: res => {
        this.quizId.set(res.data._id);
        this.toast.success('Quiz draft created');
       // alert('Quiz draft created');
      },
      error: err =>
        this.toast.error(err.error?.message || 'Failed to create quiz'),
       // alert(err.error?.message || 'Failed to create quiz'),
    });
}


  saveQuestion(): void {
    if (!this.quizId() || this.questionForm.invalid) {
      if (!this.quizId()) {
        this.toast.warning('Please save the draft first');
      } else {
        this.questionForm.markAllAsTouched();
        this.questionForm.markAllAsDirty();
        this.toast.warning('Please fill all the fields');
      }
      return;
    }

    const correctCount = this.options.value.filter(
      (o: { isCorrect: boolean }) => o.isCorrect,
    ).length;

    if (correctCount !== 1) {
      this.toast.warning('Select exactly one correct option');
      return;
    }

    // 🔥 EDIT MODE
    if (this.editingQuestionId()) {
      this.quizService
        .updateQuestion(
          this.quizId()!,
          this.editingQuestionId()!,   // 👈 questionId
          this.questionForm.getRawValue()
        )
        .subscribe({
          next: res => {
            this.toast.success('Question updated successfully');
            this.questions.set(res.data.questions);
            this.totalMarks.set(res.data.totalMarks);
            this.resetQuestionForm();
            this.editingQuestionId.set(null); // ✅ exit edit mode
          },
          error: err =>
            this.toast.error(err.error?.message || 'Failed to update question'),
        });

      return;
    }

    // ➕ ADD MODE
    this.quizService
      .addQuestion(this.quizId()!, this.questionForm.getRawValue())
      .subscribe({
        next: res => {
          this.toast.success('Question added successfully');
          this.questions.set(res.data.questions);
          this.totalMarks.set(res.data.totalMarks);
          this.resetQuestionForm();
        },
        error: err =>
          this.toast.error(err.error?.message || 'Failed to add question'),
      });
  }



  deleteQuestion(questionId: string): void {
    if (!this.quizId()) return;

    this.quizService
      .deleteQuestion(this.quizId()!, questionId)
      .subscribe({
        next: res => {
          this.questions.set(res.data.questions);
          this.totalMarks.set(res.data.totalMarks);
        },
        error: err =>
          alert(err.error?.message || 'Failed to delete question'),
      });
  }

  publishQuiz(): void {
    if (!this.quizId()){
      this.toast.warning('Please save the draft first');
      return;
    } 

    this.quizService.publishQuiz(this.quizId()!).subscribe({
      next: () => {
        this.toast.success('Quiz published 🚀'); 
        this.resetQuestionForm();
        this.quizForm.reset();
        this.quizId.set(null);
        this.questions.set([]);
        this.totalMarks.set(0);
        if(!this.authService.isAuthenticated()){
            this._retryAttemptService.increaseQuizCreated();
        }
      },
      error: err =>
        this.toast.error(err.error?.message || 'Failed to publish quiz'),
       // alert(err.error?.message || 'Failed to publish quiz'),
    });
  }

  selectCorrectOption(index: number): void {
    this.options.controls.forEach((ctrl, i) =>
      ctrl.get('isCorrect')?.setValue(i === index),
    );
  }

  private resetQuestionForm(): void {
    this.questionForm.reset({
      questionText: '',
      marks: 4,
      options: this.options.controls.map(() => ({
        text: '',
        isCorrect: false,
      })),
    });

    this.editingQuestionId.set(null);
  }


  editQuestion(question: any): void {
    this.editingQuestionId.set(question._id); // ✅ IMPORTANT

    this.questionForm.patchValue({
      questionText: question.questionText,
      marks: question.marks,
    });

    this.options.clear();
    question.options.forEach((opt: any) => {
      this.options.push(
        this.fb.group({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })
      );
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  increaseMarks() {
    const current = this.marksCtrl.value ?? 1;
    this.marksCtrl.setValue(Math.min(current + 1, 10));
  }

  decreaseMarks() {
    const current = this.marksCtrl.value ?? 1;
    this.marksCtrl.setValue(Math.max(current - 1, 1));
  }


  get marksCtrl() {
    return this.questionForm.controls.marks;
  }

  isInvalid(form: any, controlName: string) {
    const control = form.get(controlName);
    return control && control.invalid && (control.dirty || control.touched);
  }

  getError(form: any, controlName: string, label: string) {
    const control = form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${label} is required`;
    if (control.errors['min']) return `${label} must be at least ${control.errors['min'].min}`;
    return `Invalid ${label}`;
  }

  openBulkPopup() {
    console.log(this.authService.isAuthenticated())
    this.showBulkPopup.set(true);
  }

  closeBulkPopup() {
    this.showBulkPopup.set(false);
    this.bulkText = '';
  }

  clearBulkText() {
    this.bulkForm.reset();
  }

  bulkForm = this.fb.group({
    bulkText: [''],
  });


parsedQuestions: any[] = [];
parseBulkQuestions(): {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  marks: number;
}[] | void {

  const rawText = this.bulkForm.controls.bulkText.value;

  if (!rawText.trim()) {
    this.toast.warning('Paste some questions first');
    return;
  }

  const blocks = rawText
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  const questions = blocks.map((block, index) => {
    const lines = block
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const questionLine = lines.find(l => l.startsWith('Q:'));
    const optionLines = lines.filter(l => /^[A-D]\)/.test(l));
    const marksLine = lines.find(l => /^Marks:/i.test(l));

    const questionText = questionLine
      ?.replace(/^Q:/, '')
      .trim();

    const options = optionLines.map(l => ({
      text: l
        .replace(/^[A-D]\)/, '')
        .replace('*', '')
        .trim(),
      isCorrect: l.includes('*'),
    }));

    const marks = Number(
      marksLine?.replace(/^Marks:/i, '').trim() || 1
    );

    return {
      questionText,
      options,
      marks,
      __index: index + 1, // internal only
    };
  });

  // 🔎 VALIDATION
  const invalidQuestion = questions.find(q =>
    !q.questionText ||
    q.options.length !== 4 ||
    q.options.filter(o => o.isCorrect).length !== 1 ||
    !Number.isInteger(q.marks) ||
    q.marks < 1
  );

  if (invalidQuestion) {
    this.toast.error(
      `Invalid format in question #${invalidQuestion.__index}`
    );
    return;
  }

  // ✅ FINAL CLEAN RESULT (this is what you want)
  const cleanQuestions = questions.map(({ __index, ...q }) => q);

  this.parsedQuestions = cleanQuestions;
  this.showBulkPopup.set(false);
  this.quizService.sendBulkQuestionsToApi(this.quizId()!,   this.parsedQuestions).subscribe({
    next: res => {
      this.toast.success('Bulk questions added successfully');
      this.questions.set(res.data.questions);
      this.totalMarks.set(res.data.totalMarks);
      this.resetQuestionForm();
    },
    error: err =>
      this.toast.error(err.error?.message || 'Failed to add bulk questions'),
  });
  console.log('this.parsedQuestions ----->', this.parsedQuestions);
}





}
