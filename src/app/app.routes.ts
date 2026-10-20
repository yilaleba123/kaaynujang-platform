import { Routes } from '@angular/router';
//import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'formateur' },
  { path: 'connexion', title: 'Connexion', loadComponent: () => import('./auth/connexion/connexion').then(m => m.Connexion) },
  {
    path: 'formateur',
    //canActivate: [authGuard],
    loadComponent: () => import('./formateur/layout/layout').then(m => m.Layout),
    children: [
      { path: '', title: 'Tableau de bord', loadComponent: () => import('./formateur/dashboard/dashboard').then(m => m.Dashboard) },

      { path: 'mes-cours', title: 'Mes cours', loadComponent: () => import('./formateur/mes-cours/mes-cours').then(m => m.MesCours) },
      { path: 'mes-cours/:id', title: 'Détail du cours', loadComponent: () => import('./formateur/mes-cours/detail/course-detail').then(m => m.CourseDetail) },
      { path: 'cree-cours', title: 'Créer un cours', loadComponent: () => import('./formateur/cree-cours/cree-cours').then(m => m.CreeCours) },
      { path: 'cree-cours/:id', title: 'Modifier un cours', loadComponent: () => import('./formateur/cree-cours/cree-cours').then(m => m.CreeCours) },
      { path: 'documents', title: 'Documents', loadComponent: () => import('./formateur/documents/documents').then(m => m.Documents) },

      { path: 'quiz', title: 'Mes quiz', loadComponent: () => import('./formateur/quiz/quiz').then(m => m.Quiz) },
      { path: 'quiz/nouveau', title: 'Nouveau quiz', loadComponent: () => import('./formateur/quiz/quiz-form/quiz-form').then(m => m.QuizForm) },
      { path: 'quiz/:id', title: 'Modifier un quiz', loadComponent: () => import('./formateur/quiz/quiz-form/quiz-form').then(m => m.QuizForm) },
      { path: 'copies', title: 'Copies', loadComponent: () => import('./formateur/copies/copies').then(m => m.Copies) },
      { path: 'copies/:id', title: 'Correction', loadComponent: () => import('./formateur/copies/correction/correction').then(m => m.Correction) },

      { path: 'apprenants', title: 'Mes apprenants', loadComponent: () => import('./formateur/apprenants/apprenants').then(m => m.Apprenants) },
      { path: 'statistiques', title: 'Statistiques', loadComponent: () => import('./formateur/statistiques/statistiques').then(m => m.Statistiques) },
      { path: 'messagerie', title: 'Messagerie', loadComponent: () => import('./formateur/messagerie/messagerie').then(m => m.Messagerie) },

      { path: 'notifications', title: 'Notifications', loadComponent: () => import('./formateur/notifications/notifications').then(m => m.Notifications) },
      { path: 'profil', title: 'Mon profil', loadComponent: () => import('./formateur/profil/profil').then(m => m.Profil) },
    ],
  },
  { path: '**', redirectTo: 'formateur' },
];