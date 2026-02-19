import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export type ExamType = 'entrance' | 'government' | 'state' | 'bords';

export interface ExamItem {
  _id: string;
  name: string;
  type?: ExamType;
  subjectClass?: string;
  description?: string;
  logoUrl?: string;
  keyPoints?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExamsResponse {
  success: boolean;
  message: string;
  data: ExamItem[];
  pagination?: PaginationMeta;
}

export interface ExamsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ExamType;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);
  private readonly SUBJECT_API = `${environment.apiUrl}/subjects`;

  getExams(query: ExamsQuery): Observable<ExamsResponse> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.type) params = params.set('type', query.type);

    return this.http.get<ExamsResponse>(this.SUBJECT_API, { params });
  }
}
