import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { QuizPlayerService } from '../services/quiz-player.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast-service';
import { isPlatformBrowser } from '@angular/common';

/* ================= TYPES ================= */
type QuestionStatus = 'correct' | 'wrong' | 'skipped';

interface ResultQuestion {
  questionId: string;
  status: QuestionStatus;
  marks: number;
}

interface QuizResultResponse {
  totalMarks: number;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  questions: ResultQuestion[];
}

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result-page-component.html',
  styleUrl: './quiz-result-page-component.css',
})
export class QuizResultPageComponent implements OnInit {

  private router = inject(Router);
  private quizService = inject(QuizPlayerService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  /* ================= UI STATE (Signals) ================= */
  quizTitle = signal('Maths Mock Test – 1');

  totalMarks = signal(0);
  score = signal(0);

  correct = signal(0);
  wrong = signal(0);
  skipped = signal(0);

  accuracy = signal(0);
  questions = signal<ResultQuestion[]>([]);
  loading = signal(true);

  /* ================= INIT ================= */
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const attemptId = localStorage.getItem('lastAttemptId');
    console.log("attemptId -->", attemptId);

    // ✅ Hard guard
    if (!attemptId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.quizService.submitQuiz(attemptId).subscribe({
      next: (res) => {
        this.applyResult(res);
      },
      error: () => {
        this.toastService.error(
          'Failed to load quiz result. Please try again later.'
        );
        this.router.navigate(['/dashboard']);
      }
    });
  }

  /* ================= APPLY RESULT ================= */
  private applyResult(res: QuizResultResponse): void {
    this.quizTitle.set(this.quizService.quizData.title);
    this.totalMarks.set(res.totalMarks);
    this.score.set(res.score);

    this.correct.set(res.correct);
    this.wrong.set(res.wrong);
    this.skipped.set(res.skipped);

    this.accuracy.set(res.accuracy);
    this.questions.set(res.questions);

    this.loading.set(false);
  }

  goToDashboard() {
  this.router.navigate(['/dashboard']);
}

goToHome() {
  this.router.navigate(['/']);
}

showQuestionPopup = signal(false);
activeQuestionIndex = signal<number | null>(null);
activeQuestion = signal<any>(null);

openQuestionPopup(question: any, index: number) {
  this.activeQuestionIndex.set(index);
  this.activeQuestion.set(question);
  this.showQuestionPopup.set(true);
}

closeQuestionPopup() {
  this.showQuestionPopup.set(false);
  this.activeQuestionIndex.set(null);
  this.activeQuestion.set(null);
}

/* ===============================
   NAVIGATION
================================ */
setActiveQuestion(index: number) {
  this.activeQuestionIndex.set(index);
  this.activeQuestion.set(this.questions()[index]);
}

goToNextQuestion() {
  const next = this.activeQuestionIndex()! + 1;
  if (next < this.questions().length) {
    this.setActiveQuestion(next);
  }
}

goToPreviousQuestion() {
  const prev = this.activeQuestionIndex()! - 1;
  if (prev >= 0) {
    this.setActiveQuestion(prev);
  }
}




  /* ================= FUTURE API REPLACEMENT ================= */
  /*
  loadFromApi(response: QuizResultResponse): void {
    this.applyResult(response);
  }
  */
}
