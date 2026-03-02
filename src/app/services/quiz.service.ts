import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environment';
import { AuthService } from './auth.service';

export interface CreateQuizPayload {
  title: string;
  description: string;
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  visibility?: 'PUBLIC' | 'RESTRICTED';
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

  // 📦 Cached States
  public totalQuizzesCount = signal<number | null>(null);
  public attemptedQuizzesCount = signal<number | null>(null);
  public createdQuizzesList = signal<any[] | null>(null);

  /**
   * 🔄 Update all dashboard signals at once from a consolidated response
   */
  updateDashboardStats(data: any) {
    if (data.totalQuizzesCreated !== undefined) {
      this.totalQuizzesCount.set(data.totalQuizzesCreated);
    }
    if (data.createdQuizzesList !== undefined) {
      this.createdQuizzesList.set(data.createdQuizzesList);
    }
    if (data.totalQuizzesAttempted !== undefined) {
      this.attemptedQuizzesCount.set(data.totalQuizzesAttempted);
    }
  }

  /**
   * 🧹 Clear all cached local state to force a fresh fetch from the server
   */
  clearCachedSignals() {
    this.totalQuizzesCount.set(null);
    this.attemptedQuizzesCount.set(null);
    this.createdQuizzesList.set(null);
  }

  // getQuizes(): Observable<any> {
  //   return this.http.get<any>(this.API+ '?limit=10');
  // }

  createQuiz(payload: CreateQuizPayload): Observable<any> {
    let api = this.API;
    // Use public create only when user is truly unauthenticated.
    // `currentUser` can be null briefly during bootstrap even with a valid token.
    if (!this._auth.isAuthenticated()) {
      api = this.API + '/public';
    }
    return this.http.post(api, payload).pipe(
      tap(() => {
        if (this.totalQuizzesCount() !== null) {
          this.totalQuizzesCount.set(this.totalQuizzesCount()! + 1);
        }
        this.clearCachedSignals();
        this._auth.clearDashboardCache();
      })
    );
  }

  getQuizById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }

  updateQuiz(
    quizId: string,
    payload: Partial<CreateQuizPayload>,
  ): Observable<any> {
    return this.http.patch<any>(`${this.API}/${quizId}` + '/public', payload).pipe(
      tap(() => {
        this.clearCachedSignals();
        this._auth.clearDashboardCache();
      })
    );
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
    return this.http.post(`${this.API}/${quizId}/publish`, {}).pipe(
      tap(() => {
        this.clearCachedSignals();
        this._auth.clearDashboardCache();
      })
    );
  }

  assignUsers(quizId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/assign-users`, { userIds });
  }

  notifyAssociatedStudentsForQuiz(quizId: string): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/notify-students`, {});
  }

  getQuizes(filters?: {
    search?: string;
    subjectId?: string | null;
    difficulty?: string | null;
    createdByMe?: boolean;
    teacherQuizzesOnly?: boolean;
  }) {
  const params: any = {};

  if (filters?.search) params.search = filters.search;
  if (filters?.subjectId) params.subjectId = filters.subjectId;
  if (filters?.difficulty) params.difficulty = filters.difficulty;
  if (filters?.teacherQuizzesOnly) params.teacherQuizzesOnly = 'true';
  if (filters?.createdByMe) {
    const user = this._auth.currentUser();
    params.createdByMe = user?.id || user?._id;
  }

  return this.http.get<any>(
    `${this.API}`,
    { params }
  );
}

  getCountofQuizes(): Observable<any>  {
    if (this.totalQuizzesCount() !== null) {
      return of({ data: this.totalQuizzesCount() });
    }
    return this.http.get<any>(`${this.API}/createdByUser`).pipe(
      tap((res) => {
        if (res?.data !== undefined) {
          this.totalQuizzesCount.set(res.data);
        }
      })
    );
  }

  getCreatedQuizzesList(): Observable<any> {
    if (this.createdQuizzesList() !== null) {
      return of({ data: this.createdQuizzesList() });
    }
    return this.http.get<any>(`${this.API}/createdByUser/list`).pipe(
      tap((res) => {
        if (res?.data !== undefined) {
          this.createdQuizzesList.set(res.data);
        }
      })
    );
  }

  getAttemptedQuizzesCount(): Observable<{ success: boolean; count: number }> {
    if (this.attemptedQuizzesCount() !== null) {
      return of({ success: true, count: this.attemptedQuizzesCount()! });
    }
    return this.http.get<{ success: boolean; count: number }>(
      `${environment.apiUrl}/quiz-player/attempted/count`
    ).pipe(
      tap((res) => {
        if (res?.count !== undefined) {
          this.attemptedQuizzesCount.set(res.count);
        }
      })
    );
  }

  sendBulkQuestionsToApi(quizId: string, questions: any[]): Observable<any> {
    return this.http.post(`${this.API}/${quizId}/questions/bulk`,  questions );
  }

  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.API}/${quizId}`).pipe(
      tap(() => {
        if (this.totalQuizzesCount() !== null) {
          this.totalQuizzesCount.set(Math.max(0, this.totalQuizzesCount()! - 1));
        }
        this.clearCachedSignals();
        this._auth.clearDashboardCache();
      })
    );
  }
}
