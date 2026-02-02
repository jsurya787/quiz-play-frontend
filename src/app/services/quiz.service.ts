import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { AuthService } from './auth.service';

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
  private _auth = inject(AuthService);
  private readonly API =  environment.apiUrl + '/quizzes';

  // getQuizes(): Observable<any> {
  //   return this.http.get<any>(this.API+ '?limit=10');
  // }

  createQuiz(payload: CreateQuizPayload): Observable<any> {
    let api = this.API
    if(!this._auth.userData){
      api = this.API + '/public'
    }
    return this.http.post(api, payload);
  }

  updarteQuiz(
    quizId: string,
    payload: Partial<CreateQuizPayload>,
  ): Observable<any> {
    return this.http.patch<any>(`${this.API}/${quizId}` + '/public', payload);
  }

  addQuestion(
    quizId: string,
    payload: AddQuestionPayload,
  ): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/questions`, payload);
  }

  updateQuestion(
    quizId: string,
    questionId: string,
    payload: any,
  ) {
    return this.http.patch<any>(
      `${this.API}/${quizId}/questions/${questionId}`,
      payload,
    );
  }

  deleteQuestion(quizId: string, questionId: string): Observable<any> {
    return this.http.delete(
      `${this.API}/${quizId}/questions/${questionId}`,
    );
  }

  publishQuiz(quizId: string): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/publish`, {});
  }

  getQuizes(filters?: {
  search?: string;
  subjectId?: string | null;
  difficulty?: string | null;
}) {
  const params: any = {};

  if (filters?.search) params.search = filters.search;
  if (filters?.subjectId) params.subjectId = filters.subjectId;
  if (filters?.difficulty) params.difficulty = filters.difficulty;

  return this.http.get<any>(
    `${this.API}`,
    { params }
  );
}

  getCountofQuizes(): Observable<any>  {
    return this.http.get<any>(`${this.API}/createdByUser`);
  }

  getAttemptedQuizzesCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(
      `${environment.apiUrl}/quiz-player/attempted/count`
    );
  }

  sendBulkQuestionsToApi(quizId: string, questions: any[]): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/questions/bulk`,  questions );
  }

}
