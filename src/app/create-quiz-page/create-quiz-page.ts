import { Component, computed, signal, inject } from '@angular/core';
import { FormArray, Validators, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '../services/quiz.service';
import { SubjectService, Subject } from '../services/subject.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast-service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalComponent, ConfirmationType } from '../shared/modals/confirmation-modal/confirmation-modal.component';
import { TeacherService } from '../teacher/services/teacher.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-create-quiz-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent],
  templateUrl: './create-quiz-page.html',
})
export class CreateQuizPage {
  private fb = inject(NonNullableFormBuilder);
  private quizService = inject(QuizService);
  private subjectService = inject(SubjectService);
  private teacherService = inject(TeacherService);
  private toast = inject(ToastService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // 🔢 marks per question
  marks = signal(4);
  editingQuestionId = signal<string | null>(null);
  showBulkPopup = signal(false);
  bulkText = '';
  loading = signal(false); // ⏳ Loading state
  publishConfirm = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
  }>({
    isOpen: false,
    title: 'Publish Quiz',
    message: '',
    type: 'info',
  });
  notifyStudentsConfirm = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
  }>({
    isOpen: false,
    title: 'Notify Students',
    message: '',
    type: 'info',
  });
  pendingPublishedQuizId = signal<string | null>(null);
  questionSubmitAttempted = signal(false);
  associatedStudents = signal<any[]>([]);
  studentSearchTerm = signal('');
  selectedStudentIds = signal<string[]>([]);
  userPickerOpen = signal(false);
  selectedStudentsCount = computed(() => this.selectedStudentIds().length);
  filteredStudents = computed(() => {
    const search = this.studentSearchTerm().trim().toLowerCase();
    const students = this.associatedStudents();
    if (!search) return students;
    return students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim().toLowerCase();
      const email = (student.email || '').toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  });

  /* ===============================
     STATE (SIGNALS)
  ================================ */

  quizId = signal<string | null>(null);
  questions = signal<any[]>([]);
  totalMarks = signal<number>(0);
  subjects = signal<Subject[]>([]);

  questionCount = computed(() => this.questions().length);

  constructor() {
    if(this.subjectService.subjects().length === 0){
      this.loadSubjects();
    }else{
      this.subjects.set(this.subjectService.subjects());
    }

    // 🔥 Check for edit mode
    const editId = this.route.snapshot.queryParamMap.get('id');
    if (editId) {
      this.quizId.set(editId);
      this.loadQuiz(editId);
    }

    if (this.authService.isTeacher()) {
      this.loadAssociatedStudents();
    }
  }

  loadQuiz(id: string) {
    this.loading.set(true);
    this.quizService.getQuizById(id).subscribe({
      next: (res) => {
        // Support both { data: quiz } and direct quiz object
        const quiz = res.data || res;
        
        if (quiz) {
          this.quizForm.patchValue({
            title: quiz.title,
            description: quiz.description,
            subjectId: quiz.subjectId,
            difficulty: quiz.difficulty,
            timeLimit: quiz.timeLimit,
            visibility: quiz.visibility || 'RESTRICTED',
          });
          this.questions.set(quiz.questions || []);
          this.totalMarks.set(quiz.totalMarks || 0);
          this.selectedStudentIds.set(
            (quiz.allowedUserIds || [])
              .map((item: any) => (typeof item === 'string' ? item : item?._id || item?.id))
              .filter((id: any) => !!id),
          );
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error('Failed to load quiz data');
        this.loading.set(false);
      }
    });
  }

  /* ===============================
     FORMS (NON-NULLABLE ✔)
  ================================ */

  quizForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    subjectId: ['', Validators.required],
    difficulty: ['easy', Validators.required],
    timeLimit: [10, [Validators.required, Validators.min(1)]],
    visibility: ['RESTRICTED' as 'PUBLIC' | 'RESTRICTED', Validators.required],
  });

  questionForm = this.fb.group({
    questionText: ['', Validators.required],
    marks: [4, [Validators.required, Validators.min(1)]],
    options: this.fb.array(
      Array.from({ length: 4 }).map(() =>
        this.fb.group({
          text: ['', Validators.required],
          isCorrect: false,
        }),
      ),
    ),
  });

  get options(): FormArray {
    return this.questionForm.controls.options as FormArray;
  }

  /* ===============================
     ACTIONS
  ================================ */

  loadSubjects(): void {
    this.loading.set(true);
    this.subjectService.getSubjects().subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects.set(res.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error?.message || 'Failed to load subjects');
        this.loading.set(false);
      },
    });
  }

  isDraftSaved(): boolean {
    return this.quizId() !== null;
  }

  saveDraft(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      this.quizForm.markAllAsDirty();
      this.toast.warning('Please fill all the fields');
      return;
    }

    if (this.isDraftSaved()) {
      // 🔥 UPDATE DRAFT
      this.quizService.updarteQuiz(this.quizId()!, this.quizForm.value as any).subscribe({
        next: (res) => {
          this.toast.success('Quiz draft updated');
          // alert('Quiz draft created');
        },
        error: (err) => this.toast.error(err.error?.message || 'Failed to update quiz'),
        // alert(err.error?.message || 'Failed to create quiz'),
      });
      return;
    }
    // ➕ CREATE DRAFT
    this.quizService.createQuiz(this.quizForm.value as any).subscribe({
      next: (res) => {
        const createdQuizId = res?.data?._id || res?.data?.id || res?._id || res?.id || null;
        this.quizId.set(createdQuizId);
        this.toast.success('Quiz draft created');
        // alert('Quiz draft created');
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create quiz'),
      // alert(err.error?.message || 'Failed to create quiz'),
    });
  }

  saveQuestion(): void {
    this.questionSubmitAttempted.set(true);

    if (!this.quizId() || this.questionForm.invalid) {
      if (!this.quizId()) {
        this.toast.warning('Please save the draft first');
      } else {
        this.questionForm.markAllAsTouched();
        this.questionForm.markAllAsDirty();
        this.toast.warning('Please fill all the fields');
      }
      return;
    }

    const correctCount = this.options.value.filter(
      (o: { isCorrect: boolean }) => o.isCorrect,
    ).length;

    if (correctCount !== 1) {
      this.toast.warning('Select exactly one correct option');
      return;
    }

    // 🔥 EDIT MODE
    if (this.editingQuestionId()) {
      this.quizService
        .updateQuestion(
          this.quizId()!,
          this.editingQuestionId()!, // 👈 questionId
          this.questionForm.getRawValue(),
        )
        .subscribe({
          next: (res) => {
            this.toast.success('Question updated successfully');
            this.questions.set(res.data.questions);
            this.totalMarks.set(res.data.totalMarks);
            this.resetQuestionForm();
            this.editingQuestionId.set(null); // ✅ exit edit mode
            this.questionSubmitAttempted.set(false);
          },
          error: (err) => this.toast.error(err.error?.message || 'Failed to update question'),
        });

      return;
    }

    // ➕ ADD MODE
    this.quizService.addQuestion(this.quizId()!, this.questionForm.getRawValue()).subscribe({
      next: (res) => {
        this.toast.success('Question added successfully');
        this.questions.set(res.data.questions);
        this.totalMarks.set(res.data.totalMarks);
        this.resetQuestionForm();
        this.questionSubmitAttempted.set(false);
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to add question'),
    });
  }

  deleteQuestion(questionId: string): void {
    if (!this.quizId()) return;

    this.quizService.deleteQuestion(this.quizId()!, questionId).subscribe({
      next: (res) => {
        this.questions.set(res.data.questions);
        this.totalMarks.set(res.data.totalMarks);
      },
      error: (err) => alert(err.error?.message || 'Failed to delete question'),
    });
  }

  publishQuiz(): void {
    if (!this.quizId()) {
      this.toast.warning('Please save the draft first');
      return;
    }

    const publishedQuizId = this.quizId()!;
    const isTeacher = this.authService.isTeacher();
    const selectedUserIds = this.selectedStudentIds();
    const isPrivateQuiz = this.isPrivateQuizType();

    if (isTeacher && isPrivateQuiz && selectedUserIds.length === 0) {
      this.toast.warning('Select at least one student before publishing');
      return;
    }

    const publishRequest$ = isTeacher && isPrivateQuiz
      ? this.quizService
          .assignUsers(publishedQuizId, selectedUserIds)
          .pipe(switchMap(() => this.quizService.publishQuiz(publishedQuizId)))
      : this.quizService.publishQuiz(publishedQuizId);

    publishRequest$.subscribe({
      next: () => {
        this.toast.success('Quiz published successfully');
        this.pendingPublishedQuizId.set(publishedQuizId);

        const isTeacherOrAdmin = this.authService.isTeacher() || this.authService.isAdmin();
        if (isTeacherOrAdmin) {
          const notifyMessage = isTeacher && isPrivateQuiz
            ? 'Do you want to notify selected students about this newly published quiz via email?'
            : 'Do you want to notify associated students about this newly published quiz via email?';
          this.notifyStudentsConfirm.set({
            isOpen: true,
            title: 'Notify Associated Students',
            message: notifyMessage,
            type: 'info',
          });
        } else {
          this.resetAfterPublish();
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to publish quiz'),
      // alert(err.error?.message || 'Failed to publish quiz'),
    });
  }

  confirmNotifyStudentsAfterPublish(): void {
    const quizId = this.pendingPublishedQuizId();
    this.closeNotifyStudentsConfirm();

    if (!quizId) {
      this.resetAfterPublish();
      return;
    }

    this.quizService.notifyAssociatedStudentsForQuiz(quizId).subscribe({
      next: (res: any) => {
        const stats = res?.data;
        const sent = stats?.sent ?? 0;
        const total = stats?.totalRecipients ?? 0;
        this.toast.success(
          total > 0
            ? `Notification emails sent: ${sent}/${total}`
            : 'No associated student recipients found',
        );
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to notify students');
      },
    });

    this.resetAfterPublish();
  }

  skipNotifyStudentsAfterPublish(): void {
    this.closeNotifyStudentsConfirm();
    this.resetAfterPublish();
  }

  closeNotifyStudentsConfirm(): void {
    this.notifyStudentsConfirm.update((state) => ({ ...state, isOpen: false }));
  }

  private resetAfterPublish(): void {
    this.resetQuestionForm();
    this.quizForm.reset();
    this.quizForm.patchValue({ visibility: 'RESTRICTED' });
    this.quizId.set(null);
    this.pendingPublishedQuizId.set(null);
    this.parsedQuestions = [];
    this.bulkForm.reset();
    this.questions.set([]);
    this.totalMarks.set(0);
    this.selectedStudentIds.set([]);
    this.studentSearchTerm.set('');
    this.userPickerOpen.set(false);
  }

  requestPublishQuiz(): void {
    if (!this.quizId()) {
      this.publishQuiz();
      return;
    }

    const isTeacherOrAdmin = this.authService.isTeacher() || this.authService.isAdmin();
    if (!isTeacherOrAdmin) {
      this.publishQuiz();
      return;
    }

    this.publishConfirm.set({
      isOpen: true,
      title: 'Confirm Quiz Publication',
      message:
        'Are you sure you want to publish this quiz? Once published, only selected students can see and play it.',
      type: 'info',
    });
  }

  confirmPublishQuiz(): void {
    this.closePublishConfirm();
    this.publishQuiz();
  }

  closePublishConfirm(): void {
    this.publishConfirm.update((state) => ({ ...state, isOpen: false }));
  }

  selectCorrectOption(index: number): void {
    this.options.controls.forEach((ctrl, i) => ctrl.get('isCorrect')?.setValue(i === index));
  }

  public resetQuestionForm(): void {
    this.questionForm.reset({
      questionText: '',
      marks: 4,
      options: this.options.controls.map(() => ({
        text: '',
        isCorrect: false,
      })),
    });

    this.editingQuestionId.set(null);
    this.questionSubmitAttempted.set(false);
  }

  hasSelectedCorrectOption(): boolean {
    return this.options.controls.some((ctrl) => !!ctrl.get('isCorrect')?.value);
  }

  hasAnyInvalidOptionText(): boolean {
    return this.options.controls.some((ctrl) => !!ctrl.get('text')?.invalid);
  }

  editQuestion(question: any): void {
    this.editingQuestionId.set(question._id); // ✅ IMPORTANT
    this.questionSubmitAttempted.set(false);

    this.questionForm.patchValue({
      questionText: question.questionText,
      marks: question.marks,
    });

    this.options.clear();
    question.options.forEach((opt: any) => {
      this.options.push(
        this.fb.group({
          text: opt.text,
          isCorrect: opt.isCorrect,
        }),
      );
    });

    this.questionForm.markAsPristine();
    this.questionForm.markAsUntouched();
    this.options.controls.forEach((ctrl) => {
      ctrl.markAsPristine();
      ctrl.markAsUntouched();
    });

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  increaseMarks() {
    const current = this.marksCtrl.value ?? 1;
    this.marksCtrl.setValue(Math.min(current + 1, 10));
  }

  decreaseMarks() {
    const current = this.marksCtrl.value ?? 1;
    this.marksCtrl.setValue(Math.max(current - 1, 1));
  }

  get marksCtrl() {
    return this.questionForm.controls.marks;
  }

  isInvalid(form: any, controlName: string) {
    const control = form.get(controlName);
    return control && control.invalid && (control.dirty || control.touched);
  }

  getError(form: any, controlName: string, label: string) {
    const control = form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${label} is required`;
    if (control.errors['min']) return `${label} must be at least ${control.errors['min'].min}`;
    return `Invalid ${label}`;
  }

  openBulkPopup() {
    this.showBulkPopup.set(true);
  }

  closeBulkPopup() {
    this.showBulkPopup.set(false);
    this.bulkText = '';
  }

  clearBulkText() {
    this.bulkForm.reset();
  }

  loadAssociatedStudents(): void {
    this.teacherService.getStudents().subscribe({
      next: (students) => {
        const normalizedStudents = (students || []).map((student: any) => ({
          ...student,
          _quizUserId: this.resolveStudentUserId(student),
        }));
        this.associatedStudents.set(normalizedStudents);
      },
      error: () => {
        this.toast.error('Failed to load associated students');
      },
    });
  }

  toggleUserPicker(): void {
    this.userPickerOpen.update((value) => !value);
  }

  isStudentSelected(studentId: string): boolean {
    return this.selectedStudentIds().includes(studentId);
  }

  toggleStudentSelection(studentId: string): void {
    const selected = this.selectedStudentIds();
    if (selected.includes(studentId)) {
      this.selectedStudentIds.set(selected.filter((id) => id !== studentId));
      return;
    }
    this.selectedStudentIds.set([...selected, studentId]);
  }

  selectAllFilteredStudents(): void {
    const selected = new Set(this.selectedStudentIds());
    this.filteredStudents().forEach((student) => {
      const userId = this.resolveStudentUserId(student);
      if (userId) {
        selected.add(userId);
      }
    });
    this.selectedStudentIds.set(Array.from(selected));
  }

  // add every associated student irrespective of search filter
  selectAllStudents(): void {
    const ids: string[] = [];
    this.associatedStudents().forEach((student) => {
      const userId = this.resolveStudentUserId(student);
      if (userId) ids.push(userId);
    });
    this.selectedStudentIds.set(ids);
  }

  clearSelectedStudents(): void {
    this.selectedStudentIds.set([]);
  }

  setQuizVisibility(visibility: 'PUBLIC' | 'RESTRICTED'): void {
    this.quizForm.patchValue({ visibility });
    if (visibility === 'PUBLIC') {
      this.userPickerOpen.set(false);
    }
  }

  isPrivateQuizType(): boolean {
    return this.quizForm.controls.visibility.value === 'RESTRICTED';
  }

  getStudentDisplayName(student: any): string {
    const name = [student?.firstName, student?.lastName].filter(Boolean).join(' ').trim();
    return name || student?.name || 'Student';
  }

  private resolveStudentUserId(student: any): string | null {
    return (
      student?._quizUserId ||
      student?.userId ||
      student?.user?._id ||
      student?.student?._id ||
      student?.studentId ||
      student?._id ||
      student?.id ||
      null
    );
  }

  bulkForm = this.fb.group({
    bulkText: [''],
  });

  parsedQuestions: any[] = [];
  parseBulkQuestions():
    | {
        questionText: string;
        options: { text: string; isCorrect: boolean }[];
        marks: number;
      }[]
    | void {
    const rawText = this.bulkForm.controls.bulkText.value;

    if (!rawText.trim()) {
      this.toast.warning('Paste some questions first');
      return;
    }

    const blocks = rawText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    const questions = blocks.map((block, index) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const questionLine = lines.find((l) => l.startsWith('Q:'));
      const optionLines = lines.filter((l) => /^[A-D]\)/.test(l));
      const marksLine = lines.find((l) => /^Marks:/i.test(l));

      const questionText = questionLine?.replace(/^Q:/, '').trim();

      const options = optionLines.map((l) => ({
        text: l
          .replace(/^[A-D]\)/, '')
          .replace('*', '')
          .trim(),
        isCorrect: l.includes('*'),
      }));

      const marks = Number(marksLine?.replace(/^Marks:/i, '').trim() || 1);

      return {
        questionText,
        options,
        marks,
        __index: index + 1, // internal only
      };
    });

    // 🔎 VALIDATION
    const invalidQuestion = questions.find(
      (q) =>
        !q.questionText ||
        q.options.length !== 4 ||
        q.options.filter((o) => o.isCorrect).length !== 1 ||
        !Number.isInteger(q.marks) ||
        q.marks < 1,
    );

    if (invalidQuestion) {
      this.toast.error(`Invalid format in question #${invalidQuestion.__index}`);
      return;
    }

    // ✅ FINAL CLEAN RESULT (this is what you want)
    const cleanQuestions = questions.map(({ __index, ...q }) => q);

    this.parsedQuestions = cleanQuestions;
    this.showBulkPopup.set(false);
    this.quizService.sendBulkQuestionsToApi(this.quizId()!, this.parsedQuestions).subscribe({
      next: (res) => {
        this.toast.success('Bulk questions added successfully');
        this.questions.set(res.data.questions);
        this.totalMarks.set(res.data.totalMarks);
        this.resetQuestionForm();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to add bulk questions'),
    });
  }
}
