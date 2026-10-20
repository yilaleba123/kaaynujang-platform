import { Routes } from '@angular/router';
//import { authGuard } from './auth/auth-guard';
import { Layout } from './apprenant/layout/layout';
import { Dashboard } from './apprenant/dashboard/dashboard';
import { MesCours } from './apprenant/mes-cours/mes-cours';
import { Catalogue } from './apprenant/catalogue/catalogue';
import { DetailCours } from './apprenant/detail-cours/detail-cours';
import { Lecon } from './apprenant/lecon/lecon';
import { Quiz } from './apprenant/quiz/quiz';
import { Resultats } from './apprenant/resultats/resultats';
import { Certificats } from './apprenant/certificats/certificats';
import { Forum } from './apprenant/forum/forum';
import { Notifications } from './apprenant/notifications/notifications';
import { Profil } from './apprenant/profil/profil';


import { LoginComponent } from './components/login/login';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'formateur' },
  { path: 'login', component: LoginComponent },
  { path: 'connexion', title: 'Connexion', loadComponent: () => import('./auth/connexion/connexion').then(m => m.Connexion) },
  { path: 'inscription', title: 'Inscription', loadComponent: () => import('./auth/inscription/inscription').then(m => m.Inscription) },
  { path: 'mot-de-passe-oublie', title: 'Mot de passe oublié', loadComponent: () => import('./auth/mot-de-passe-oublie/mot-de-passe-oublie').then(m => m.MotDePasseOublie) },
  { path: 'reinitialiser-mot-de-passe', title: 'Réinitialiser le mot de passe', loadComponent: () => import('./auth/reinitialiser-mot-de-passe/reinitialiser-mot-de-passe').then(m => m.ReinitialiserMotDePasse) },
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
   
  // Routes de l'espace apprenant.
  {
    // Le layout reste affiché sur toutes les pages apprenant.
    path: 'apprenant',
    component: Layout,

    // Les pages affichées dans le router-outlet du layout.
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'mes-cours',
        component: MesCours,
      },
      {
        path: 'catalogue',
        component: Catalogue,
      },
      {
        path: 'cours/:coursId/lecons/:leconId',
        component: Lecon,
      },
      {
        path: 'cours/:id',
        component: DetailCours,
      },
      {
        path: 'quiz',
        component: Quiz,
      },
      {
        path: 'resultats',
        component: Resultats,
      },
      {
        path: 'certificats',
        component: Certificats,
      },
      {
        path: 'forum',
        component: Forum,
      },
      {
        path: 'notifications',
        component: Notifications,
      },
      {
        path: 'profil',
        component: Profil,
      },

      // Page affichée si /apprenant est ouvert directement.
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

