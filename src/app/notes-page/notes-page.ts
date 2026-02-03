import {
  Component,
  signal,
  OnInit,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesService, Note } from '../services/notes.service';
import { ToastService } from '../services/toast-service'; // adjust path
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [FormsModule],
  providers: [NotesService],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.scss',
})
export class NotesPage implements OnInit {

  searchTerm = '';

  // ✅ IMPORTANT: start with LIST on mobile
  isMobileEditorOpen = signal(false);

  activeNote = signal<Note | null>(null);

  saving = signal(false);
  private search$ = new Subject<string>();

  constructor(
    public notesService: NotesService,
    private toaster: ToastService,
  ) {}

  ngOnInit() {
    this.notesService.loadNotes();
    this.search$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
      )
      .subscribe(term => {
        // 🔹 if empty → load all
        if (!term) {
          this.notesService.loadNotes();
          return;
        }

        // 🔹 minimum 2 characters
        if (term.length < 2) return;

        this.notesService.loadNotes(term);
      });
    }

  // ================= SCREEN =================
  isLargeScreen = signal(window.innerWidth >= 1024);

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen.set(window.innerWidth >= 1024);
  }

  // ================= NOTES =================
  selectNote(note: Note) {
    this.activeNote.set(note);
    this.isMobileEditorOpen.set(true);
  }

  createNote() {
    this.notesService.createNote((createdNote) => {
      // ✅ show immediately
      this.activeNote.set(createdNote);
      this.isMobileEditorOpen.set(true);

      this.toaster.success('New note created');
    });
  }

  updateNote(event: Event) {
    if (!this.activeNote()) return;

    const content = (event.target as HTMLTextAreaElement).value;
    const title =
      content.split('\n')[0]?.slice(0, 60) || 'Untitled';

    const updated: Note = {
      ...this.activeNote()!,
      title,
      content,
    };

    this.activeNote.set(updated);

    // 🔥 feedback
    this.saving.set(true);
    this.toaster.info('Saving…');

    this.notesService.queueAutosave(updated, () => {
      this.saving.set(false);
      this.toaster.success('Saved ✔');
    });
  }

  filterNotes() {
    this.search$.next(this.searchTerm.trim());
  }

  backToList() {
    this.isMobileEditorOpen.set(false);
  }
}
