import { Component, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../services/subject.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chapter-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter-page.html',
  styleUrl: './chapter-page.scss',
})
export class ChapterPage {

  /* ===============================
     INJECTIONS
  ================================ */
  private route = inject(ActivatedRoute);
  private chapterService = inject(SubjectService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  /* ===============================
     STATE
  ================================ */
  chapterId = signal<string | null>(null);
  chapter = signal<any>(null);
  sections = signal<any[]>([]);
  activeSectionId = signal<string | null>(null);
  loading = signal(true);

  /* 🔐 TEMP ADMIN FLAG */
  isAdmin = signal(false);

  /* ===============================
     OBSERVER
  ================================ */
  private observer: IntersectionObserver | null = null;

  /* ===============================
     POPUP STATE
  ================================ */
  showPopup = signal(false);
  popupType = signal<'section' | 'confirmDelete' | null>(null);
  popupTitle = signal('');
  formModel = signal<any>({});
  deleteSectionId = signal<string | null>(null);

  /* ===============================
     INIT
  ================================ */
  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('chapterId');
      if (!id) return;
      this.isAdmin.set(this.authService.isAdmin());
      this.chapterId.set(id);
      this.loadChapter(id);
    });

    // Clean up observer on destroy
    effect((onCleanup) => {
      onCleanup(() => {
        this.observer?.disconnect();
      });
    });
  }

  /* ===============================
     LOAD CHAPTER
  ================================ */
  private loadChapter(chapterId: string) {
    this.loading.set(true);

    this.chapterService.getChapterById(chapterId).subscribe({
      next: (res) => {
        this.chapter.set(res.data);
        this.sections.set(res.data.sections || []);
        this.loading.set(false);
        
        // Initialize observer after sections are loaded
        setTimeout(() => this.initScrollObserver(), 100);
      },
      error: () => this.loading.set(false),
    });
  }

  private initScrollObserver() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.observer?.disconnect();

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '');
          this.activeSectionId.set(id);
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is near the top
      threshold: 0
    });

    this.sections().forEach(sec => {
      const el = document.getElementById(`section-${sec._id}`);
      if (el) this.observer?.observe(el);
    });
  }

  /* ===============================
     ADMIN – OPEN POPUPS
  ================================ */
  openAddSection() {
    this.popupType.set('section');
    this.popupTitle.set('Add Section');
    this.formModel.set({
      title: '',
      content: '',
      type: 'theory',
      order: this.sections().length + 1,
      isActive: true,
    });
    this.showPopup.set(true);
  }

  openEditSection(section: any) {
    this.popupType.set('section');
    this.popupTitle.set('Edit Section');
    this.formModel.set({ ...section });
    this.showPopup.set(true);
  }

  confirmDeleteSection(sectionId: string) {
    this.popupType.set('confirmDelete');
    this.popupTitle.set('Delete Section');
    this.deleteSectionId.set(sectionId);
    this.showPopup.set(true);
  }

  /* ===============================
     SAVE / DELETE (SECTION APIs)
  ================================ */
  saveForm() {
    const chapterId = this.chapterId();
    const data = this.formModel();
    if (!chapterId) return;

    /* ===== ADD ===== */
    if (!data._id) {
      this.chapterService
        .addSectionToChapter(chapterId, data)
        .subscribe(res => {
          this.sections.set(res.data.sections);
          this.closePopup();
        });
      return;
    }

    /* ===== UPDATE ===== */
    const sectionId = data._id;
    delete data._id;
    this.chapterService
      .updateSectionToChapter(chapterId, sectionId, data)
      .subscribe(res => {
        this.sections.set(res.data.sections);
        this.closePopup();
      });
  }

  performDelete() {
    const chapterId = this.chapterId();
    const sectionId = this.deleteSectionId();
    if (!chapterId || !sectionId) return;

    this.chapterService
      .deleteSectionFromChapter(chapterId, sectionId)
      .subscribe(res => {
        this.sections.set(res.data.sections);
        this.closePopup();
      });
  }

  closePopup() {
    this.showPopup.set(false);
    this.popupType.set(null);
    this.popupTitle.set('');
    this.formModel.set({});
    this.deleteSectionId.set(null);
  }

  /* ===============================
     SCROLL
  ================================ */
  scrollTo(sectionId: string) {
    document
      .getElementById(`section-${sectionId}`)
      ?.scrollIntoView({ behavior: 'smooth' });
  }
}
