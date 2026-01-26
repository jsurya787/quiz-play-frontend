import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../services/subject.service';

@Component({
  selector: 'app-chapter-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter-page.html',
  styleUrl: './chapter-page.css',
})
export class ChapterPage {

  /* ===============================
     INJECTIONS
  ================================ */
  private route = inject(ActivatedRoute);
  private chapterService = inject(SubjectService);

  /* ===============================
     STATE
  ================================ */
  chapterId = signal<string | null>(null);
  chapter = signal<any>(null);
  sections = signal<any[]>([]);
  loading = signal(true);

  /* 🔐 TEMP ADMIN FLAG */
  isAdmin = signal(true);

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

      this.chapterId.set(id);
      this.loadChapter(id);
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
      },
      error: () => this.loading.set(false),
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
