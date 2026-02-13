import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { inject, signal, OnInit, Component, PLATFORM_ID, Inject } from '@angular/core';
import { ToastService } from '../../../services/toast-service';
import { ConfirmationModalComponent, ConfirmationType } from '../../../shared/modals/confirmation-modal/confirmation-modal.component';

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

  activeTab = signal<'subjects' | 'users' | 'redis'>('subjects');
  userTab = signal<'teachers' | 'students'>('teachers');
  
  stats = signal<any>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0
  });

  teachers = signal<any[]>([]);
  students = signal<any[]>([]);
  loading = signal(false);

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
      this.loadTeachers();
      this.loadStudents();
    }
  }

  loadStats() {
    this.adminService.getStats().subscribe(res => this.stats.set(res));
  }

  loadTeachers() {
    this.adminService.getTeachers().subscribe(res => this.teachers.set(res));
  }

  loadStudents() {
    this.adminService.getStudents().subscribe(res => this.students.set(res));
  }

  syncCache() {
    this.loading.set(true);
    this.adminService.syncCache().subscribe({
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
      this.adminService.clearCache().subscribe({
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
      message: `Are you sure you want to ${action} ${name} to ${role}?`,
      type,
      action: () => this.executeAssignRole(user, role)
    });
  }

  executeAssignRole(user: any, role: 'STUDENT' | 'TEACHER') {
    this.loading.set(true);
    this.adminService.assignRole(user._id, role).subscribe({
      next: (res: any) => {
        this.toaster.success(`User role updated to ${role}`);
        // Refresh lists
        this.loadTeachers();
        this.loadStudents();
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