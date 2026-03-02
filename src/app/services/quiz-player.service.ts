import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environment';
import { QuizService } from './quiz.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuizPlayerService {
  private baseUrl =  environment.apiUrl + '/quiz-player';
  private quizService = inject(QuizService);
  private auth = inject(AuthService);
  
  public resultResponse : any;
  public quizData : any;

  constructor(private http: HttpClient) {}

  // 🎯 Get quiz for playing (authenticated users)
  getQuiz(quizId: string) {
    return this.http.get<any>(`${this.baseUrl}/${quizId}`, {
      withCredentials: true
    });
  }

  // 🎯 Get quiz for playing (guest users - public)
  getQuizPublic(quizId: string) {
    return this.http.get<any>(`${this.baseUrl}/${quizId}/public`, {
      withCredentials: true
    });
  }

  // 📝 Start attempt (authenticated users)
  startAttempt(quizId: string, userId: string) {
    return this.http.post<any>(`${this.baseUrl}/${quizId}/start`, { userId }, {
      withCredentials: true
    });
  }

  // 📝 Start attempt (guest users - uses cookies)
  startAttemptPublic(quizId: string) {
    return this.http.post<any>(`${this.baseUrl}/${quizId}/start/public`, {}, {
      withCredentials: true // 🔑 Required for cookie handling
    });
  }

  // 💾 Save answer (authenticated users)
  saveAnswer(payload: {
    attemptId: string;
    questionId: string;
    selectedOptionIndex: number;
  }) {
    return this.http.post(`${this.baseUrl}/answer`, payload, {
      withCredentials: true
    });
  }

  // 💾 Save answer (guest users - uses cookies)
  saveAnswerPublic(payload: {
    attemptId: string;
    questionId: string;
    selectedOptionIndex: number;
  }) {
    return this.http.post(`${this.baseUrl}/answer/public`, payload, {
      withCredentials: true // 🔑 Sends guest_session cookie
    });
  }

  // 🚀 Submit quiz (authenticated users)
  submitQuiz(attemptId: string) {
    return this.http.post<any>(`${this.baseUrl}/${attemptId}/submit`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Increment the attempted quizzes count if it's already loaded
        const currentCount = this.quizService.attemptedQuizzesCount();
        if (currentCount !== null) {
          this.quizService.attemptedQuizzesCount.set(currentCount + 1);
        }
        // 🧹 Clear the dashboard cache to force refresh on next load
        this.quizService.clearCachedSignals();
        this.auth.clearDashboardCache();
      })
    );
  }

  // 🚀 Submit quiz (guest users - uses cookies)
  submitQuizPublic(attemptId: string) {
    return this.http.post<any>(`${this.baseUrl}/${attemptId}/submit/public`, {}, {
      withCredentials: true // 🔑 Validates session ownership
    });
  }

  // 📊 Get quiz result (authenticated users)
  getResult(attemptId: string) {
    return this.http.get<any>(`${this.baseUrl}/result/${attemptId}`, {
      withCredentials: true
    });
  }

  // 📊 Get quiz result (guest users - uses cookies)
  getResultPublic(attemptId: string) {
    return this.http.get<any>(`${this.baseUrl}/result/${attemptId}/public`, {
      withCredentials: true // 🔑 Validates session ownership
    });
  }

  getAttemptedQuizzes() {
    return this.http.get<any>(`${this.baseUrl}/attempted`, {
      withCredentials: true
    });
  }
}
