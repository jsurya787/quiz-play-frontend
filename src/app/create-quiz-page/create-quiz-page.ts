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



saveDraft(): void {
  if (this.quizForm.invalid) return;

  this.quizService
    .createQuiz(this.quizForm.value as any)
    .subscribe({
      next: res => {
        this.quizId.set(res.data._id);
        alert('Quiz draft created');
      },
      error: err =>
        alert(err.error?.message || 'Failed to create quiz'),
    });
}


  saveQuestion(): void {
    if (!this.quizId() || this.questionForm.invalid) return;

    const correctCount = this.options.value.filter(
      (o: { isCorrect: boolean }) => o.isCorrect,
    ).length;

    if (correctCount !== 1) {
      alert('Select exactly one correct option');
      return;
    }

    this.quizService
      .addQuestion(this.quizId()!, this.questionForm.getRawValue())
      .subscribe({
        next: res => {
          this.questions.set(res.data.questions);
          this.totalMarks.set(res.data.totalMarks);
          this.resetQuestionForm();
        },
        error: err =>
          alert(err.error?.message || 'Failed to add question'),
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
    if (!this.quizId()) return;

    this.quizService.publishQuiz(this.quizId()!).subscribe({
      next: () => alert('Quiz published 🚀'),
      error: err =>
        alert(err.error?.message || 'Failed to publish quiz'),
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
  }
}
