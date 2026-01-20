import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

/* ===============================
   TYPES (MATCH BACKEND RESPONSE)
================================ */

export interface Subject {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectApiResponse {
  success: boolean;
  message: string;
  data: Subject[];
}

/* ===============================
   SERVICE
================================ */

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private http = inject(HttpClient);
  private readonly API =  environment.apiUrl + '/subjects';

  getSubjects(): Observable<SubjectApiResponse> {
    return this.http.get<SubjectApiResponse>(this.API);
  }
}
