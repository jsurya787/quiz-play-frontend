import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private http = inject(HttpClient);
  private readonly QUIZ_API = environment.apiUrl + '/quizzes';
  private readonly PLAYER_API = environment.apiUrl + '/quiz-player';
  private readonly TEACHER_API = environment.apiUrl + '/teacher';

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.PLAYER_API}/teacher/stats`);
  }

  getSubmissions(): Observable<any> {
    return this.http.get<any>(`${this.PLAYER_API}/teacher/submissions`);
  }

  getStudents(search = ''): Observable<any[]> {
    const term = search.trim();
    const params = term ? new HttpParams().set('search', term) : undefined;
    return this.http.get<any>(`${this.TEACHER_API}/students`, { params }).pipe(
      map((res: any) => this.normalizeListResponse(res))
    );
  }

  searchAssociatedStudents(search = ''): Observable<any[]> {
    return this.getStudents(search);
  }

  addStudent(email: string): Observable<any> {
    return this.http.post<any>(`${this.TEACHER_API}/students/add`, { email });
  }

  removeStudent(studentId: string): Observable<any> {
    return this.http.delete<any>(`${this.TEACHER_API}/students/${studentId}`);
  }

  getQuizzes(userId: string, filters?: any): Observable<any> {
    // Teacher usually only needs their own quizzes
    const params = { ...filters, createdByMe: userId };
    return this.http.get<any>(this.QUIZ_API, { params });
  }

  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.QUIZ_API}/${quizId}`);
  }

  updateQuizVisibility(quiz: any, visibility: 'PUBLIC' | 'RESTRICTED'): Observable<any> {
    const payload = {
      title: quiz.title,
      description: quiz.description,
      subjectId: quiz.subjectId,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      visibility,
    };
    return this.http.patch<any>(`${this.QUIZ_API}/${quiz._id}/public`, payload);
  }

  notifyStudentsForQuiz(quizId: string): Observable<any> {
    return this.http.post<any>(`${this.QUIZ_API}/${quizId}/notify-students`, {});
  }

  private normalizeListResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }
}
