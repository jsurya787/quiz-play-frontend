import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, switchMap, tap } from 'rxjs';
import { signal } from '@angular/core';
import { environment } from '../../../environment';

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

@Injectable()
export class NotesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/notes';

  notes = signal<Note[]>([]);

  private autosave$ = new Subject<{
    note: Note;
    cb?: () => void;
  }>();

  constructor() {
    this.autosave$
      .pipe(
        debounceTime(500),
        switchMap(({ note, cb }) =>
          this.http
            .patch<ApiResponse<Note>>(
              `${this.apiUrl}/${note._id}`,
              {
                title: note.title,
                content: note.content,
              },
            )
            .pipe(
              tap(res => {
                if (res.status) {
                  this.notes.update(n =>
                    n.map(x =>
                      x._id === res.data._id ? res.data : x,
                    ),
                  );
                  cb?.();
                }
              }),
            ),
        ),
      )
      .subscribe();
  }

  loadNotes(search = '') {
    this.http
      .get<ApiResponse<Note[]>>(this.apiUrl, {
        params: search ? { search } : {},
      })
      .subscribe(res => {
        if (res.status) this.notes.set(res.data);
      });
  }

  createNote(cb?: (note: Note) => void) {
    this.http
      .post<ApiResponse<Note>>(this.apiUrl, {})
      .subscribe(res => {
        if (res.status) {
          this.notes.update(n => [res.data, ...n]);
          cb?.(res.data);
        }
      });
  }

  queueAutosave(note: Note, cb?: () => void) {
    this.autosave$.next({ note, cb });
  }

  deleteNote(id: string) {
    this.http
      .delete<ApiResponse<null>>(`${this.apiUrl}/${id}`)
      .subscribe(() => {
        this.notes.update(n => n.filter(x => x._id !== id));
      });
  }
}
