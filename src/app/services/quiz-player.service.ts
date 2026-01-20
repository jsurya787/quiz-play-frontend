import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';

@Injectable({ providedIn: 'root' })
export class QuizPlayerService {
  private baseUrl =  environment.apiUrl + '/quiz-player';
  public resultResponse : any;

  constructor(private http: HttpClient) {}

  getQuiz(quizId: string) {
    return this.http.get<any>(`${this.baseUrl}/${quizId}`);
  }

  startAttempt(quizId: string, userId: string) {
    return this.http.post<any>(`${this.baseUrl}/${quizId}/start`, { userId });
  }

  saveAnswer(payload: {
    attemptId: string;
    questionId: string;
    selectedOptionIndex: number;
  }) {
    return this.http.post(`${this.baseUrl}/answer`, payload);
  }

  submitQuiz(attemptId: string) {
    return this.http.post<any>(`${this.baseUrl}/${attemptId}/submit`, {});
  }
}
