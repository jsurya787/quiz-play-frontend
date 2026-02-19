import { Component, OnInit, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizPlayerService } from '../services/quiz-player.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast-service';

@Component({
  imports: [CommonModule],
  selector: 'app-quiz-player-page',
  templateUrl: './quiz-player-page.html',
  styleUrl: './quiz-player-page.scss',
})
export class QuizPlayerPageComponent implements OnInit {
  quizId!: string;
  attemptId = signal<string | null>(null);
  answeredMap = signal<Record<number, number>>({});
  private _toastService = inject(ToastService);
  private _platformId = inject(PLATFORM_ID);


  quiz = signal<any>(null);
  currentIndex = signal(0);
  loading = signal(true);
  Object = Object;

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
    const totalSec = Math.max(this.totalTime() - this.elapsedTime(), 0);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  timerTone = computed<'safe' | 'warn' | 'danger' | 'normal'>(() => {
    const remaining = this.remainingSeconds();
    const total = this.totalTime();

    if (total > 0 && remaining / total <= 0.1) return 'danger';
    if (remaining < 40) return 'warn';
    if (remaining > 60) return 'safe';
    return 'normal';
  });

  private timerRef: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizPlayerService,
    public authService: AuthService
  ) {}

  /* =======================
     LIFECYCLE
     ======================= */

  async ngOnInit(): Promise<void> {
    this.quizId = this.route.snapshot.paramMap.get('quizId')!;
    this.initForm();
    
    // ✅ APP_INITIALIZER already called bootstrapAuth() - no need to call again
    
    // 🚫 Check Platform - ONLY RUN ON BROWSER
    if (isPlatformBrowser(this._platformId)) {
      this.loadQuiz();
    }
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
    const quizObservable = this.authService.isAuthenticated()
      ? this.quizService.getQuiz(this.quizId)
      : this.quizService.getQuizPublic(this.quizId);

    quizObservable.subscribe(res => {
      this.loading.set(false);
      this.quiz.set(res.data);

      // ⏱ init timer
      this.totalTime.set(res.data.timeLimit * 60);
      this.startTimer();

      this.startAttempt();
    }, err => {
      this.loading.set(true);
      if (err.status === 403) {
        this._toastService.error('Access Denied: This quiz is restricted to specific batches.');
      } else {
        this._toastService.error('Failed to load quiz. Please try again later.');
      }
      setTimeout(() => {
        this.router.navigate(['/dashboard/all']);
      }, 3000);
    });
  }
// 695f7eceebf73de912504bc3 for static user

  startAttempt() {
    // ✅ Use guest endpoint if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.quizService
        .startAttemptPublic(this.quizId)
        .subscribe({
          next: (res) => {
            this.attemptId.set(res.attemptId);
          },
          error: (err) => {
            if (err.status === 403) {
              this._toastService.info(
                "You've reached the guest limit of 10 quizzes. If you want to continue or play more quizzes, please login – it's completely free of cost!",
                10000
              );
              this.router.navigate(['/dashboard/all']);
            }
          }
        });
    } else {
      // 🔐 Use authenticated endpoint
      this.quizService
        .startAttempt(this.quizId, this.authService.currentUser()?.id!)
        .subscribe(res => {
          this.attemptId.set(res.attemptId);
        });
    }
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

  const payload = {
    attemptId: this.attemptId()!,
    questionId: this.currentQuestion()._id,
    selectedOptionIndex: index,
  };

  // ✅ Use guest endpoint if not authenticated
  if (!this.authService.isAuthenticated()) {
    this.quizService.saveAnswerPublic(payload).subscribe();
  } else {
    this.quizService.saveAnswer(payload).subscribe();
  }
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
  }

  /* =======================
     UI HELPERS
     ======================= */

  isTimeLow(): boolean {
    return this.timerTone() === 'danger';
  }

showMobilePalette = false;
showExitConfirm = signal(false);

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

openExitConfirm(): void {
  this.showMobilePalette = false;
  this.showExitConfirm.set(true);
}

closeExitConfirm(): void {
  this.showExitConfirm.set(false);
}

submitFromExitConfirm(): void {
  this.showExitConfirm.set(false);
  this.submitQuiz();
}
}
