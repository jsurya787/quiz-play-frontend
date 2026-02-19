import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment';
import { Observable, catchError, forkJoin, map } from 'rxjs';

@Injectable()
export class AdminService {
  private http = inject(HttpClient);
  private API = `${environment.apiUrl}/admin`;

  getStats(): Observable<any> {
    return this.http.get(`${this.API}/stats`);
  }

  getTeachers(): Observable<any> {
    return this.http.get(`${this.API}/teachers`);
  }

  getStudents(): Observable<any> {
    return this.http.get(`${this.API}/students`);
  }

  getInactiveUsers(search = ''): Observable<any[]> {
    const term = search.trim();
    const params = term ? new HttpParams().set('search', term) : undefined;
    return this.http.get<any>(`${this.API}/users/inactive`, { params }).pipe(
      map((res: any) => this.normalizeInactiveUsersResponse(res))
    );
  }

  syncCache(): Observable<any> {
    return this.http.post(`${this.API}/sync-all-cache`, {});
  }

  clearCache(): Observable<any> {
    return this.http.post(`${this.API}/clear-cache`, {});
  }

  assignRole(userId: string, role: 'STUDENT' | 'TEACHER'): Observable<any> {
    return this.http.post(`${this.API}/assign-role`, { userId, role });
  }

  deactivateUser(userId: string): Observable<any> {
    return this.http.patch(`${this.API}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: string): Observable<any> {
    return this.http.patch(`${this.API}/users/${userId}/activate`, {});
  }

  searchUsers(search = ''): Observable<{ teachers: any[]; students: any[] }> {
    const term = search.trim();
    const params = term ? new HttpParams().set('search', term) : undefined;

    return this.http.get<any>(`${this.API}/users/search`, { params }).pipe(
      map((res: any) => this.normalizeSearchResponse(res)),
      catchError(() =>
        forkJoin({
          teachers: this.getTeachers(),
          students: this.getStudents()
        }).pipe(
          map(({ teachers, students }) => {
            const teacherList = this.normalizeListResponse(teachers);
            const studentList = this.normalizeListResponse(students);

            if (!term) {
              return { teachers: teacherList, students: studentList };
            }

            const lowered = term.toLowerCase();
            return {
              teachers: teacherList.filter((user) => this.matchesUser(user, lowered)),
              students: studentList.filter((user) => this.matchesUser(user, lowered))
            };
          })
        )
      )
    );
  }

  private normalizeSearchResponse(res: any): { teachers: any[]; students: any[] } {
    const source = res?.data ?? res ?? {};
    return {
      teachers: this.normalizeListResponse(source.teachers),
      students: this.normalizeListResponse(source.students)
    };
  }

  private normalizeInactiveUsersResponse(res: any): any[] {
    const source = res?.data ?? res ?? {};
    return this.normalizeListResponse(source.users);
  }

  private normalizeListResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private matchesUser(user: any, loweredSearch: string): boolean {
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const displayName = user?.displayName || user?.name || '';
    const email = user?.email || '';
    const haystack = `${name} ${displayName} ${email}`.toLowerCase();
    return haystack.includes(loweredSearch);
  }
}
