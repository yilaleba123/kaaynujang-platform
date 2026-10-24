import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { PendingValidationComponent } from './components/shared/pending-validation/pending-validation';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { AdminLayoutComponent } from './components/dashboard/admin/admin-layout/admin-layout';
import { AdminHomeComponent } from './components/dashboard/admin/pages/admin-home/admin-home';
import { AdminTeachersComponent } from './components/dashboard/admin/pages/admin-teachers/admin-teachers';
import { AdminStudentsComponent } from './components/dashboard/admin/pages/admin-students/admin-students';
import { AdminCoursesComponent } from './components/dashboard/admin/pages/admin-courses/admin-courses';
import { AdminCourseValidationComponent } from './components/dashboard/admin/pages/admin-course-validation/admin-course-validation';
import { AdminCategoriesComponent } from './components/dashboard/admin/pages/admin-categories/admin-categories';
import { AdminForumComponent } from './components/dashboard/admin/pages/admin-forum/admin-forum';
import { AdminStatsComponent } from './components/dashboard/admin/pages/admin-stats/admin-stats';
import { AdminLogsComponent } from './components/dashboard/admin/pages/admin-logs/admin-logs';
import { AdminNotificationsComponent } from './components/dashboard/admin/pages/admin-notifications/admin-notifications';
import { AdminProfileComponent } from './components/dashboard/admin/pages/admin-profile/admin-profile';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pending-validation', component: PendingValidationComponent },

  // Espace Administration (Protections par Guards)
  {
    path: 'dashboard/admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'teachers', component: AdminTeachersComponent },
      { path: 'students', component: AdminStudentsComponent },
      { path: 'courses', component: AdminCoursesComponent },
      { path: 'course-validation', component: AdminCourseValidationComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'forum', component: AdminForumComponent },
      { path: 'stats', component: AdminStatsComponent },
      { path: 'logs', component: AdminLogsComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'profile', component: AdminProfileComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];
