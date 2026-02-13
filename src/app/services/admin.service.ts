import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
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

  syncCache(): Observable<any> {
    return this.http.post(`${this.API}/sync-all-cache`, {});
  }

  clearCache(): Observable<any> {
    return this.http.post(`${this.API}/clear-cache`, {});
  }
}
