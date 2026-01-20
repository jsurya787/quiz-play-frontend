import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface CreateQuizPayload {
  title: string;
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

export interface AddQuestionPayload {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  marks: number;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);
  private readonly API =  environment.apiUrl + '/quizzes';

  getQuizes(): Observable<any> {
    return this.http.get<any>(this.API);
  }

  createQuiz(payload: CreateQuizPayload): Observable<any> {
    return this.http.post(this.API, payload);
  }

  addQuestion(
    quizId: string,
    payload: AddQuestionPayload,
  ): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/questions`, payload);
  }

  deleteQuestion(quizId: string, questionId: string): Observable<any> {
    return this.http.delete(
      `${this.API}/${quizId}/questions/${questionId}`,
    );
  }

  publishQuiz(quizId: string): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/publish`, {});
  }
}
