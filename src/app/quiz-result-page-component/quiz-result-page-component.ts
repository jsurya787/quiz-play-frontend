import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { QuizPlayerService } from '../services/quiz-player.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast-service';
import { isPlatformBrowser, CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [CommonModule],
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


  /* ================= COMPUTED ================= */
  percentage = signal(0); // will be updated in applyResult

  /* ================= APPLY RESULT ================= */
  private applyResult(res: QuizResultResponse): void {
    this.quizTitle.set(this.quizService.quizData?.title || 'Quiz Result');
    this.totalMarks.set(res.totalMarks);
    this.score.set(res.score);
    this.percentage.set(Math.round((res.score / res.totalMarks) * 100) || 0);

    this.correct.set(res.correct);
    this.wrong.set(res.wrong);
    this.skipped.set(res.skipped);

    this.accuracy.set(res.accuracy);
    this.questions.set(res.questions);

    this.loading.set(false);
  }

  getScoreColor(percent: number): string {
    if (percent >= 90) return '#10B981'; // Emerald
    if (percent >= 70) return '#34D399'; // Green-400
    if (percent >= 50) return '#6366F1'; // Indigo
    return '#475569'; // Slate-600 (Dark Gray) for Keep Learning
  }

  openReview() {
    // Scroll to the map or open first question
    document.querySelector('.question-dot')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  goToDashboard() {
  this.router.navigate(['/student/dashboard/all']);
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
