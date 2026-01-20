import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboard } from './dashboard/admin-dashboard/admin-dashboard';

import { SubjectAdminList } from './subjects/subject-admin-list/subject-admin-list';
import { SubjectAdminForm } from './subjects/subject-admin-form/subject-admin-form';

import { ChapterAdminList } from './chapters/chapter-admin-list/chapter-admin-list';
import { ChapterAdminForm } from './chapters/chapter-admin-form/chapter-admin-form';

import { SectionAdminList } from './sections/section-admin-list/section-admin-list';
import { SectionAdminForm } from './sections/section-admin-form/section-admin-form';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboard,
    children: [
      // Subjects
      { path: 'subjects', component: SubjectAdminList },
      { path: 'subjects/new', component: SubjectAdminForm },
      // { path: 'subjects/:id/edit', component: SubjectAdminForm },

      // Chapters
      // { path: 'subjects/:subjectId/chapters', component: ChapterAdminList },
      // { path: 'subjects/:subjectId/chapters/new', component: ChapterAdminForm },
      // { path: 'chapters/:id/edit', component: ChapterAdminForm },

      // Sections
      // { path: 'chapters/:chapterId/sections', component: SectionAdminList },
      // { path: 'chapters/:chapterId/sections/new', component: SectionAdminForm },
      // { path: 'sections/:id/edit', component: SectionAdminForm },

     // Default
     { path: '', redirectTo: 'subjects', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
