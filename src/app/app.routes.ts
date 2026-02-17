import { Routes } from '@angular/router';
import { AdminService } from './admin/services/admin.service';
import { TeacherService } from './teacher/services/teacher.service';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { roleGuard } from './guards/role.guard';

// ==============================
// ROUTES (SSR OPTIMIZED + SECURE)
// ==============================
export const routes: Routes = [

  // --------------------------------------------------
  // 🔐 GOOGLE OAUTH CALLBACK (MUST BE FIRST)
  // --------------------------------------------------
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./auth/google-callback/google-callback')
        .then(m => m.GoogleCallbackComponent),
  },

  // --------------------------------------------------
  // 🔑 AUTH PAGES (PUBLIC ONLY)
  // ❌ BLOCK IF ALREADY LOGGED IN
  // --------------------------------------------------
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login')
        .then(m => m.LoginComponent),
    canActivate: [PublicGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup')
        .then(m => m.SignupComponent),
    canActivate: [PublicGuard],
  },

  // --------------------------------------------------
  // 🏠 PUBLIC PAGES (SSR FIRST RENDER)
  // --------------------------------------------------
  {
    path: '',
    loadComponent: () =>
      import('./public/landing/landing')
        .then(m => m.LandingComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./public/about/about')
        .then(m => m.AboutComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./public/privacy/privacy')
        .then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./public/terms/terms')
        .then(m => m.TermsComponent),
  },

  // --------------------------------------------------
  // 🎓 PROTECTED STUDENT AREA
  // --------------------------------------------------
  {
    path: 'teacher/dashboard',
    loadComponent: () =>
      import('./teacher/teacher-dashboard/teacher-dashboard').then(
        (m) => m.TeacherDashboardComponent
      ),
    canActivate: [AuthGuard, roleGuard(['ADMIN', 'TEACHER'])],
    providers: [TeacherService],
  },
  {
    path: 'dashboard/:subjectId',
    loadComponent: () =>
      import('./student/dashboard/dashboard')
        .then(m => m.DashboardComponent),
   // canActivate: [AuthGuard],
  },
  {
  path: 'login-success',
  loadComponent: () =>
    import('./login-success-component/login-success-component')
      .then(m => m.LoginSuccessComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'subject-page/:subjectId',
    loadComponent: () =>
      import('./subject-page/subject-page')
        .then(m => m.SubjectPage),
   // canActivate: [AuthGuard],
  },
    {
    path: 'chapter-page/:chapterId',
    loadComponent: () =>
      import('./chapter-page/chapter-page')
        .then(m => m.ChapterPage),
   // canActivate: [AuthGuard],
  },
  {
    path: 'quiz-player-page/:quizId',
    loadComponent: () =>
      import('./quiz-player-page/quiz-player-page')
        .then(m => m.QuizPlayerPageComponent),
   // canActivate: [AuthGuard],
  },
  {
    path: 'quiz-result',
    loadComponent: () =>
      import('./quiz-result-page-component/quiz-result-page-component')
        .then(m => m.QuizResultPageComponent),
   // canActivate: [AuthGuard],
  },
  {
    path: 'create-quiz-page',
    loadComponent: () =>
      import('./create-quiz-page/create-quiz-page')
        .then(m => m.CreateQuizPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./calendar-page/calendar-page')
        .then(m => m.CalendarPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./notes-page/notes-page')
        .then(m => m.NotesPage),
    canActivate: [AuthGuard],
  },

  // --------------------------------------------------
  // 🛠️ ADMIN (LAZY MODULE)
  // --------------------------------------------------
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-module')
        .then(m => m.AdminModule),
    canActivate: [AuthGuard, roleGuard(['ADMIN'])],
    providers: [AdminService],
  },

  // --------------------------------------------------
  // 🚨 FALLBACK (ALWAYS LAST)
  // --------------------------------------------------
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
