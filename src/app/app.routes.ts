import { Routes } from '@angular/router';
import { LandingComponent } from './public/landing/landing';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { DashboardComponent } from './student/dashboard/dashboard';
//import { QuizPlayComponent } from './quiz/quiz-play/quiz-play';
//import { AdminModule } from './admin/admin-module';
import { SubjectPage } from './subject-page/subject-page';
import { QuizPlayerPage } from './quiz-player-page/quiz-player-page';
import { CreateQuizPage } from './create-quiz-page/create-quiz-page';
import { ChapterPagePage } from './chapter-page-page/chapter-page-page';

export const routes: Routes = [
    // app-routing.module.ts
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-module').then(m => m.AdminModule),
  },
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'subject-page', component: SubjectPage },
  { path: 'create-quiz-page', component: CreateQuizPage },
  { path: 'quiz-player-page', component: QuizPlayerPage },
  { path: 'chapter-page', component: ChapterPagePage },
  { path: 'dashboard', component: DashboardComponent },
  //{ path: 'quiz/:id', component: QuizPlayComponent },
  //{ path: 'admin/quiz', component: AdminQuizComponent },
];
