import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { inject, signal, OnInit, Component, PLATFORM_ID, Inject, DestroyRef } from '@angular/core';
import { ToastService } from '../../../services/toast-service';
import { ConfirmationModalComponent, ConfirmationType } from '../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { ADMIN_EMAIL_TEMPLATE, TEACHER_EMAIL_TEMPLATE } from '../../../shared/email-templates';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private toaster = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private userSearch$ = new Subject<string>();

  activeTab = signal<'subjects' | 'users' | 'redis'>('subjects');
  userTab = signal<'teachers' | 'students' | 'inactive'>('teachers');
  
  stats = signal<any>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0
  });

  teachers = signal<any[]>([]);
  students = signal<any[]>([]);
  inactiveUsers = signal<any[]>([]);
  userSearchTerm = signal('');
  loading = signal(false);
  teacherEmailTemplate = TEACHER_EMAIL_TEMPLATE;
  adminEmailTemplate = ADMIN_EMAIL_TEMPLATE;

  confirmModal = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmationType;
    action?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // 🚫 Skip API calls on server to prevent 401 errors
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
      this.setupUserSearch();
      this.userSearch$.next('');
    }
  }

  onUserSearch(value: string) {
    this.userSearchTerm.set(value);
    this.userSearch$.next(value);
  }

  private setupUserSearch() {
    this.userSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          forkJoin({
            active: this.adminService.searchUsers(term),
            inactive: this.adminService.getInactiveUsers(term),
          }).pipe(
            catchError((err: any) => {
              console.error('Failed to search users', err);
              return of({
                active: { teachers: [], students: [] },
                inactive: [],
              });
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ active, inactive }) => {
        this.teachers.set(active?.teachers || []);
        this.students.set(active?.students || []);
        this.inactiveUsers.set(inactive || []);
      });
  }

  private refreshUsers() {
    forkJoin({
      active: this.adminService.searchUsers(this.userSearchTerm()),
      inactive: this.adminService.getInactiveUsers(this.userSearchTerm()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ active, inactive }) => {
          this.teachers.set(active?.teachers || []);
          this.students.set(active?.students || []);
          this.inactiveUsers.set(inactive || []);
        },
      });
  }

  loadStats() {
    this.adminService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.stats.set(res));
  }

  loadTeachers() {
    this.adminService.getTeachers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.teachers.set(res));
  }

  loadStudents() {
    this.adminService.getStudents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.students.set(res));
  }

  syncCache() {
    this.loading.set(true);
    this.adminService.syncCache().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.toaster.success(res.message);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearCache() {
    if (confirm('Are you sure you want to clear ALL Redis cache? This may cause temporary performance degradation.')) {
      this.loading.set(true);
      this.adminService.clearCache().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.toaster.success(res.message);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  getUserName(user: any): string {
    return user.displayName || user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : 'User');
  }

  assignRole(user: any, role: 'STUDENT' | 'TEACHER') {
    const name = this.getUserName(user);
    const action = role === 'TEACHER' ? 'promote' : 'demote';
    const type: ConfirmationType = role === 'TEACHER' ? 'info' : 'danger';
    
    this.confirmModal.set({
      isOpen: true,
      title: `${action === 'promote' ? 'Promote' : 'Demote'} User`,
      message: role === 'TEACHER'
        ? `Are you sure you want to ${action} ${name} to ${role}? ${this.teacherEmailTemplate.helperText}`
        : `Are you sure you want to ${action} ${name} to ${role}?`,
      type,
      action: () => this.executeAssignRole(user, role)
    });
  }

  deactivateUser(user: any) {
    const name = this.getUserName(user);
    this.confirmModal.set({
      isOpen: true,
      title: 'Deactivate User',
      message: `Deactivate ${name}? This is a soft delete and will block login until reactivated.`,
      type: 'danger',
      action: () => this.executeDeactivateUser(user),
    });
  }

  private executeDeactivateUser(user: any) {
    this.loading.set(true);
    this.adminService.deactivateUser(user._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.toaster.success(res?.message || 'User deactivated');
        this.refreshUsers();
        this.loadStats();
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toaster.error(err?.error?.message || 'Failed to deactivate user');
        this.loading.set(false);
      },
    });
  }

  activateUser(user: any) {
    const name = this.getUserName(user);
    this.confirmModal.set({
      isOpen: true,
      title: 'Activate User',
      message: `Activate ${name}? User will be able to login again.`,
      type: 'info',
      action: () => this.executeActivateUser(user),
    });
  }

  private executeActivateUser(user: any) {
    this.loading.set(true);
    this.adminService.activateUser(user._id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.toaster.success(res?.message || 'User activated');
        this.refreshUsers();
        this.loadStats();
        this.loading.set(false);
      },
      error: (err: any) => {
        this.toaster.error(err?.error?.message || 'Failed to activate user');
        this.loading.set(false);
      },
    });
  }

  executeAssignRole(user: any, role: 'STUDENT' | 'TEACHER') {
    this.loading.set(true);
    this.adminService.assignRole(user._id, role).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.toaster.success(res?.emailNotice || `User role updated to ${role}`);
        // Always refresh lists immediately (even if search term hasn't changed).
        this.refreshUsers();
        this.loadStats();
        this.loading.set(false);
      },
      error: (err: any) => {
         this.toaster.error(err.error?.message || 'Failed to update role');
         this.loading.set(false);
      }
    });
  }

  onConfirmAction() {
    this.confirmModal().action?.();
    this.closeConfirm();
  }

  closeConfirm() {
    this.confirmModal.update(s => ({ ...s, isOpen: false }));
  }

  subjects: any[] = [
    {
      id: 'sub_math',
      name: 'Mathematics',
      chapterCount: 3,
      sectionCount: 7,
      chapters: [
        {
          id: 'ch_algebra',
          title: 'Algebra',
          sections: [
            { id: 'sec_linear', title: 'Linear Equations' },
            { id: 'sec_quadratic', title: 'Quadratic Equations' },
            { id: 'sec_polynomial', title: 'Polynomials' },
          ],
        },
        {
          id: 'ch_geometry',
          title: 'Geometry',
          sections: [
            { id: 'sec_lines', title: 'Lines & Angles' },
            { id: 'sec_triangles', title: 'Triangles' },
          ],
        },
        {
          id: 'ch_probability',
          title: 'Probability',
          sections: [
            { id: 'sec_basics', title: 'Basics of Probability' },
            { id: 'sec_events', title: 'Events & Outcomes' },
          ],
        },
      ],
    },

    {
      id: 'sub_physics',
      name: 'Physics',
      chapterCount: 2,
      sectionCount: 5,
      chapters: [
        {
          id: 'ch_mechanics',
          title: 'Mechanics',
          sections: [
            { id: 'sec_motion', title: 'Motion in One Dimension' },
            { id: 'sec_laws', title: 'Laws of Motion' },
            { id: 'sec_work', title: 'Work, Power & Energy' },
          ],
        },
        {
          id: 'ch_thermo',
          title: 'Thermodynamics',
          sections: [
            { id: 'sec_heat', title: 'Heat & Temperature' },
            { id: 'sec_laws_thermo', title: 'Laws of Thermodynamics' },
          ],
        },
      ],
    },

    {
      id: 'sub_chem',
      name: 'Chemistry',
      chapterCount: 1,
      sectionCount: 3,
      chapters: [
        {
          id: 'ch_atomic',
          title: 'Atomic Structure',
          sections: [
            { id: 'sec_atoms', title: 'Atoms & Molecules' },
            { id: 'sec_models', title: 'Atomic Models' },
            { id: 'sec_quantum', title: 'Quantum Numbers' },
          ],
        },
      ],
    },
  ];

}
