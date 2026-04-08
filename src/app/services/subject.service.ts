import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environment';

/* ===============================
   TYPES
================================ */

export interface Subject {
  _id: string;
  name: string;
  type?: 'entrance' | 'government' | 'state' | 'bords';
  priority?: number;
  description?: string;
  subjectClass?: string;
  keyPoints?: string[];
  logoUrl?: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectPayload {
  name: string;
  type: 'entrance' | 'government' | 'state' | 'bords';
  priority: number;
  subjectClass: string;
  description: string;
  keyPoints: string[];
  isPrimary: boolean;
  isActive: boolean;
  logoUrl: string;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

export interface HotTopic {
  _id?: string;
  title: string;
  description?: string;
  priority: number;
}

export interface SubjectInfo {
  _id?: string;
  subjectId: string;
  hotTopics: HotTopic[];
}

export interface Section {
  _id?: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}

export interface Chapter {
  _id?: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  sections: Section[];
}

export interface SubjectPageResponse {
  success: boolean;
  data: {
    subject: Subject;
    subjectInfo: SubjectInfo;
    chapters: Chapter[];
    quizzes: any[];
  };
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private http = inject(HttpClient);

  private readonly SUBJECT_API = `${environment.apiUrl}/subjects`;
  private readonly SUBJECT_INFO_API = `${environment.apiUrl}/subject-info`;
  private readonly CHAPTER_API = `${environment.apiUrl}/chapters`;
  private readonly QUIZ_API = `${environment.apiUrl}/quizzes`;
  private primarySubjectsRequest$?: Observable<Subject[]>;
  subjects = signal<any[]>([]);
  primarySubjects = signal<any[]>([]);


  getSubjects(): Observable<{ success: boolean; data: Subject[] }> {
    return this.http.get<{ success: boolean; data: Subject[] }>(
      this.SUBJECT_API
    ).pipe(
      tap(res => {
        if (res.success) {
          this.subjects.set(res.data);
        }
      })
    );
  }

  getPrimarySubjects(): Observable<{ success: boolean; data: Subject[] }> {
    return this.http.get<{ success: boolean; data: Subject[] }>(
      this.SUBJECT_API + '/primary'
    );
  }

  loadPrimarySubjects(forceRefresh = false): Observable<Subject[]> {
    if (!forceRefresh && this.primarySubjects().length > 0) {
      return of(this.primarySubjects());
    }

    if (!forceRefresh && this.primarySubjectsRequest$) {
      return this.primarySubjectsRequest$;
    }

    this.primarySubjectsRequest$ = this.getPrimarySubjects().pipe(
      map((res) =>
        [...(res?.data ?? [])].sort(
          (a, b) =>
            (a.priority ?? Number.MAX_SAFE_INTEGER) -
            (b.priority ?? Number.MAX_SAFE_INTEGER)
        )
      ),
      tap((subjects) => this.primarySubjects.set(subjects)),
      finalize(() => {
        this.primarySubjectsRequest$ = undefined;
      }),
      shareReplay(1)
    );

    return this.primarySubjectsRequest$;
  }

  clearPrimarySubjectsCache(): void {
    this.primarySubjects.set([]);
    this.primarySubjectsRequest$ = undefined;
  }

  /* ===============================
     PAGE API
  ================================ */
  getSubjectPage(subjectId: string): Observable<SubjectPageResponse> {
    return this.http.get<SubjectPageResponse>(
      `${this.SUBJECT_INFO_API}/${subjectId}/page`
    );
  }

  createNewSubject(payload: CreateSubjectPayload): Observable<any> {
    return this.http.post(this.SUBJECT_API, payload);
  }

  /* ===============================
     SUBJECT (ADMIN)
  ================================ */
  updateSubject(
    subjectId: string,
    payload: UpdateSubjectPayload
  ): Observable<any> {
    return this.http.put(`${this.SUBJECT_API}/${subjectId}`, payload);
  }

  deleteSubject(subjectId: string): Observable<any> {
    return this.http.delete(`${this.SUBJECT_API}/${subjectId}`);
  }

  /* ===============================
     SUBJECT INFO / HOT TOPICS (ADMIN)
  ================================ */
  upsertSubjectInfo(payload: SubjectInfo): Observable<any> {
    return this.http.post(this.SUBJECT_INFO_API, payload);
  }

  /* ===============================
     CHAPTER (ADMIN)
  ================================ */

  getChapterById(chapterId: string): Observable<any> {
    return this.http.get(`${this.CHAPTER_API}/${chapterId}`);
  }

  createChapter(payload: Chapter): Observable<any> {
    return this.http.post(this.CHAPTER_API, payload);
  }

  updateChapter(chapterId: string, payload: Partial<Chapter>): Observable<any> {
    return this.http.put(`${this.CHAPTER_API}/${chapterId}`, payload);
  }

  deleteChapter(chapterId: string): Observable<any> {
    return this.http.delete(`${this.CHAPTER_API}/${chapterId}`);
  }

 /* ===============================
   ADD SECTION
================================ */
addSectionToChapter(
  chapterId: string,
  payload: Section
): Observable<any> {
  return this.http.post(
    `${this.CHAPTER_API}/${chapterId}/sections`,
    payload
  );
}

/* ===============================
   UPDATE SECTION
================================ */
updateSectionToChapter(
  chapterId: string,
  sectionId: string,
  payload: Section
): Observable<any> {
  return this.http.put(
    `${this.CHAPTER_API}/${chapterId}/sections/${sectionId}`,
    payload
  );
}

/* ===============================
   DELETE SECTION
================================ */
deleteSectionFromChapter(
  chapterId: string,
  sectionId: string
): Observable<any> {
  return this.http.delete(
    `${this.CHAPTER_API}/${chapterId}/sections/${sectionId}`
  );
}


  /* ===============================
     QUIZ (ADMIN)
  ================================ */
  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.QUIZ_API}/${quizId}`);
  }
}
