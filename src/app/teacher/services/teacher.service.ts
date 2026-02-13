import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable()
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

  getStudents(): Observable<any> {
    return this.http.get<any>(`${this.TEACHER_API}/students`);
  }

  addStudent(email: string): Observable<any> {
    return this.http.post<any>(`${this.TEACHER_API}/students/add`, { email });
  }

  getQuizzes(userrId: string, filters?: any): Observable<any> {
    // Teacher usually only needs their own quizzes
    const params = { ...filters, createdByMe: userrId };
    return this.http.get<any>(this.QUIZ_API, { params });
  }

  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.QUIZ_API}/${quizId}`);
  }
}
