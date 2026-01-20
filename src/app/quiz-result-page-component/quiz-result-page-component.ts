import { Component, signal, OnInit } from '@angular/core';
import { QuizPlayerService } from '../services/quiz-player.service';

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

  constructor(
    private quizService: QuizPlayerService,
  ) {}

  /* ================= MOCK RESPONSE (YOUR EXACT DATA) ================= */
  private readonly resultResponse: QuizResultResponse = {
    totalMarks: 20,
    score: 12,
    correct: 3,
    wrong: 2,
    skipped: 0,
    accuracy: 60,
    questions: [
      {
        questionId: '6961fa526e25a88e49eb5024',
        status: 'correct',
        marks: 4
      },
      {
        questionId: '6961fa886e25a88e49eb5030',
        status: 'correct',
        marks: 4
      },
      {
        questionId: '6961fac76e25a88e49eb5041',
        status: 'wrong',
        marks: 0
      },
      {
        questionId: '6961fae86e25a88e49eb5057',
        status: 'wrong',
        marks: 0
      },
      {
        questionId: '6961fb176e25a88e49eb5072',
        status: 'correct',
        marks: 4
      }
    ]
  };

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
    this.applyResult(this.quizService.resultResponse);
  }

  /* ================= APPLY RESULT ================= */
  private applyResult(res: QuizResultResponse): void {
    this.totalMarks.set(res.totalMarks);
    this.score.set(res.score);

    this.correct.set(res.correct);
    this.wrong.set(res.wrong);
    this.skipped.set(res.skipped);

    this.accuracy.set(res.accuracy);
    this.questions.set(res.questions);

    this.loading.set(false);
  }

  /* ================= FUTURE API REPLACEMENT ================= */
  /*
  loadFromApi(response: QuizResultResponse): void {
    this.applyResult(response);
  }
  */
}
