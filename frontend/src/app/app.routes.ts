import { Routes } from '@angular/router';

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

// Routes de l'espace apprenant.
export const routes: Routes = [
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

  // Page affichée à l'ouverture de l'application.
  {
    path: '',
    redirectTo: 'apprenant/dashboard',
    pathMatch: 'full',
  },
];
