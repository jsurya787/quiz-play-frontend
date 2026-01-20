import { Routes } from '@angular/router';
import { LandingComponent } from './public/landing/landing';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { DashboardComponent } from './student/dashboard/dashboard';
import { SubjectPage } from './subject-page/subject-page';
import { QuizPlayerPageComponent } from './quiz-player-page/quiz-player-page';
import { CreateQuizPage } from './create-quiz-page/create-quiz-page';
import { ChapterPagePage } from './chapter-page-page/chapter-page-page';
import { AuthGuard } from './guards/auth.guard';
import { QuizResultPageComponent } from './quiz-result-page-component/quiz-result-page-component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
  },

  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'subject-page', component: SubjectPage },
  { path: 'create-quiz-page', component: CreateQuizPage },
  { path: 'quiz-player-page/:quizId', component: QuizPlayerPageComponent },
  { path: 'quiz-result', component: QuizResultPageComponent},
  { path: 'chapter-page', component: ChapterPagePage },
  { path: 'dashboard', component: DashboardComponent },

  /** ✅ Fallback route (ALWAYS LAST) */
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
