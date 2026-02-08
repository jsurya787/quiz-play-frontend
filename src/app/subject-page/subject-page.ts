import { Component, signal, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../services/subject.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-subject-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './subject-page.html',
  styleUrl: './subject-page.scss',
})
export class SubjectPage {
  private route = inject(ActivatedRoute);
  private subjectService = inject(SubjectService);
  private authService = inject(AuthService);

  subjectId = signal<string | null>(null);
  subject = signal<any>(null);
  subjectInfo = signal<any>(null);
  chapters = signal<any[]>([]);
  quizzes = signal<any[]>([]);
  loading = signal(true);

  isAdmin = signal(false); // 🔐 replace later with AuthService

  /* ================= POPUP ================= */
  showPopup = signal(false);
  popupType = signal<'subject' | 'hotTopic' | 'chapter' | 'confirmDelete' | null>(null);
  popupTitle = signal('');
  formModel = signal<any>({});
  deleteContext = signal<{ type: 'hotTopic' | 'chapter' | 'quiz'; id: string } | null>(null);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('subjectId');
      if (!id) return;
      this.subjectId.set(id);
      this.loadSubjectPage(id);
    });
    this.isAdmin.set(this.authService.isAdmin());
  }

  private loadSubjectPage(id: string) {
    this.subjectService.getSubjectPage(id).subscribe((res) => {
      this.subject.set(res.data.subject);
      this.subjectInfo.set(res.data.subjectInfo);
      this.chapters.set(res.data.chapters || []);
      this.quizzes.set(res.data.quizzes || []);
      this.loading.set(false);
    });
  }

  /* ================= OPEN POPUPS ================= */

  openEditSubject() {
    this.popupType.set('subject');
    this.popupTitle.set('Edit Subject');
    this.formModel.set({ ...this.subject() });
    this.showPopup.set(true);
  }

  openHotTopic(topic?: any) {
    this.popupType.set('hotTopic');
    this.popupTitle.set(topic ? 'Edit Hot Topic' : 'Add Hot Topic');

    this.formModel.set(
      topic
        ? { ...topic }
        : {
            title: '',
            description: '',
            priority: 1, // 👈 DEFAULT
          },
    );

    this.showPopup.set(true);
  }

  openChapter(chapter?: any) {
    this.popupType.set('chapter');
    this.popupTitle.set(chapter ? 'Edit Chapter' : 'Add Chapter');

    this.formModel.set(
      chapter
        ? { ...chapter }
        : {
            name: '',
            description: '',
            order: 1,
            isActive: true,
            sections: [],
          },
    );

    this.showPopup.set(true);
  }

  confirmDelete(type: 'hotTopic' | 'chapter' | 'quiz', id: string) {
    this.popupType.set('confirmDelete');
    this.popupTitle.set('Confirm Delete');
    this.deleteContext.set({ type, id });
    this.showPopup.set(true);
  }

  /* ================= SAVE ================= */

  saveForm() {
    const data = this.formModel();

    switch (this.popupType()) {
      /* ================= SUBJECT ================= */
      case 'subject': {
        const { _id, ...payload } = data;

        this.subjectService
          .updateSubject(this.subjectId()!, payload)
          .subscribe((res) => this.subject.set(res.data));

        break;
      }

      /* ================= HOT TOPIC ================= */
      case 'hotTopic': {
        const info = this.subjectInfo();
        const hotTopics = info?.hotTopics || [];

        // remove _id explicitly
        const sanitizedTopic = {
          title: data.title,
          description: data.description,
          priority: data.priority,
        };

        const updatedHotTopics = data._id
          ? hotTopics.map((t: any) =>
              t._id === data._id
                ? sanitizedTopic
                : {
                    title: t.title,
                    description: t.description,
                    priority: Number(t.priority),
                  },
            )
          : [
              ...hotTopics.map((t: any) => ({
                title: t.title,
                description: t.description,
                priority: Number(t.priority),
              })),
              sanitizedTopic,
            ];

        this.subjectService
          .upsertSubjectInfo({
            subjectId: this.subjectId()!,
            hotTopics: updatedHotTopics,
          })
          .subscribe((res) => this.subjectInfo.set(res.data));

        break;
      }

      /* ================= CHAPTER ================= */
      case 'chapter': {
        const { _id, sections, subjectId, createdAt, updatedAt, __v, ...rest } = data; // ✅ strip everything backend-controlled

        const payload = {
          ...rest,
        };

        if (_id) {
          this.subjectService.updateChapter(_id, payload).subscribe((updated) => {
            const data = updated.data;
            this.chapters.set(this.chapters().map((c) => (c._id === data._id ? data : c)));
          });
        } else {
          // CREATE
          const data = {
            ...payload,
            sections: [],
            subjectId: this.subjectId()!,
          };
          this.subjectService.createChapter(data).subscribe((created) => {
            this.chapters.set([...this.chapters(), created.data]);
          });
        }

        break;
      }
    }

    this.closePopup();
  }

  /* ================= DELETE ================= */

  performDelete() {
    const ctx = this.deleteContext();
    if (!ctx) return;

    if (ctx.type === 'chapter') {
      this.subjectService
        .deleteChapter(ctx.id)
        .subscribe(() => this.chapters.set(this.chapters().filter((c) => c._id !== ctx.id)));
    }

    if (ctx.type === 'hotTopic') {
      const info = this.subjectInfo();
      if (!info) return;

      const updatedHotTopics = info.hotTopics
        .filter((t: any) => t._id !== ctx.id)
        .map((t: any) => ({
          title: t.title,
          description: t.description,
          priority: Number(t.priority),
        }));

      this.subjectService
        .upsertSubjectInfo({
          subjectId: this.subjectId()!,
          hotTopics: updatedHotTopics,
        })
        .subscribe((res) => this.subjectInfo.set(res.data));
    }

    if(ctx.type === 'quiz') {
      this.subjectService.deleteQuiz(ctx.id).subscribe(() => this.quizzes.set(this.quizzes().filter((q) => q._id !== ctx.id)));
    }

    this.closePopup();
  }

  closePopup() {
    this.showPopup.set(false);
    this.popupType.set(null);
    this.formModel.set({});
    this.deleteContext.set(null);
  }
}
