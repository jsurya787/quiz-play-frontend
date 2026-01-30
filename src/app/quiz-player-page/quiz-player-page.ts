import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizPlayerService } from '../services/quiz-player.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RetryAttemptService } from '../services/retry-attempt-service';
import { ToastService } from '../services/toast-service';

@Component({
  imports: [CommonModule],
  selector: 'app-quiz-player-page',
  templateUrl: './quiz-player-page.html',
})
export class QuizPlayerPageComponent implements OnInit {
  quizId!: string;
  attemptId = signal<string | null>(null);
  answeredMap = signal<Record<number, number>>({});
  private _retryAttemptService = inject(RetryAttemptService);
  private _toastService = inject(ToastService);


  quiz = signal<any>(null);
  currentIndex = signal(0);
  loading = signal(true);

  answerForm!: FormGroup;

  /* =======================
     COMPUTED DATA
     ======================= */

  totalQuestions = computed(() =>
    this.quiz()?.questions?.length ?? 0,
  );

  currentQuestion = computed(() =>
    this.quiz()?.questions[this.currentIndex()],
  );

  progressPercent = computed(() =>
    this.totalQuestions()
      ? Math.round(((this.currentIndex() + 1) / this.totalQuestions()) * 100)
      : 0,
  );

  /* =======================
     TIMER (⏱)
     ======================= */

  totalTime = signal<number>(0);     // seconds
  elapsedTime = signal<number>(0);

  // ✅ ADDED: remaining seconds (for warning logic)
  remainingSeconds = computed(() =>
    Math.max(this.totalTime() - this.elapsedTime(), 0)
  );

  remainingTime = computed(() => {
    const remaining = this.remainingSeconds();
    const min = Math.floor(remaining / 60).toString().padStart(2, '0');
    const sec = (remaining % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  });

  private timerRef: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizPlayerService,
    private authService: AuthService
  ) {}

  /* =======================
     LIFECYCLE
     ======================= */

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('quizId')!;
    this.initForm();
    this.loadQuiz();
    if(!this.authService.isAuthenticated() && !this._retryAttemptService.canAttempt()) {
      this._toastService.info('You’ve reached the maximum attempts. Log in with Google to continue, or try again after 24 hours.', 4000);
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 4500);
    }
    this._retryAttemptService.resetAll();
  }

  /* =======================
     INIT
     ======================= */

  initForm() {
    this.answerForm = this.fb.group({
      selectedOptionIndex: [null],
    });
  }

  loadQuiz() {
    this.quizService.getQuiz(this.quizId).subscribe(res => {
      this.loading.set(false);
      this.quiz.set(res.data);

      // ⏱ init timer
      this.totalTime.set(res.data.timeLimit * 60);
      this.startTimer();

      this.startAttempt();
    }, err=>{
      this.loading.set(true);
      this._toastService.error('Failed to load quiz. Please try again later.');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    });
  }
// 695f7eceebf73de912504bc3 for static user

  startAttempt() {
    this.quizService
      .startAttempt(this.quizId, this.authService?.userData?.id || '695f7eceebf73de912504bc3')
      .subscribe(res => {
        this.attemptId.set(res.attemptId);
      });
  }

  /* =======================
     TIMER LOGIC
     ======================= */

  startTimer() {
    this.timerRef = setInterval(() => {
      this.elapsedTime.update(v => v + 1);

      if (this.elapsedTime() >= this.totalTime()) {
        clearInterval(this.timerRef);
        this.submitQuiz(); // auto submit
      }
    }, 1000);
  }

  /* =======================
     ANSWER ACTIONS
     ======================= */

selectOption(index: number) {
  if (this.answeredMap()[this.currentIndex()] === index) {
    return; // 🛑 same option clicked again
  }

  this.answerForm.patchValue({ selectedOptionIndex: index });

  this.answeredMap.update(map => ({
    ...map,
    [this.currentIndex()]: index,
  }));

  this.quizService.saveAnswer({
    attemptId: this.attemptId()!,
    questionId: this.currentQuestion()._id,
    selectedOptionIndex: index,
  }).subscribe();
}




  /* =======================
     NAVIGATION
     ======================= */

  next() {
    if (this.currentIndex() < this.totalQuestions() - 1) {
      this.currentIndex.update(v => v + 1);
      this.answerForm.reset();
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(v => v - 1);
      this.answerForm.reset();
    }
  }

  jumpTo(index: number) {
    if (index >= 0 && index < this.totalQuestions()) {
      this.currentIndex.set(index);
      this.answerForm.reset();
    }
  }

  /* =======================
     SUBMIT
     ======================= */

  submitQuiz() {
    localStorage.setItem('lastAttemptId', this.attemptId()!);
     this.quizService.quizData = this.quiz();
      this.router.navigate(['/quiz-result']);
    if(!this.authService.isAuthenticated()){
        this._retryAttemptService.increaseAttempt();
    }
  }

  /* =======================
     UI HELPERS
     ======================= */

  isTimeLow(): boolean {
    return this.remainingSeconds() <= 30;
  }

showMobilePalette = false;

openPalette() {
  this.showMobilePalette = true;
}

closePalette() {
  this.showMobilePalette = false;
}

jumpAndClose(i: number) {
  this.jumpTo(i);
  this.showMobilePalette = false;
}
hasAnswered(index: number): boolean {
  return this.answeredMap()[index] !== undefined;
}
}
