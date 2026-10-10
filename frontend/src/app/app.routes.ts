import { Routes } from '@angular/router';

import { Dashboard } from './apprenant/dashboard/dashboard';
import { MesCours } from './apprenant/mes-cours/mes-cours';
import { Catalogue } from './apprenant/catalogue/catalogue';
import { Quiz } from './apprenant/quiz/quiz';
import { Resultats } from './apprenant/resultats/resultats';
import { Certificats } from './apprenant/certificats/certificats';
import { Forum } from './apprenant/forum/forum';
import { Notifications } from './apprenant/notifications/notifications';
import { Profil } from './apprenant/profil/profil';

// Pages de l'espace apprenant
export const routes: Routes = [
  { path: 'apprenant/dashboard', component: Dashboard },
  { path: 'apprenant/mes-cours', component: MesCours },
  { path: 'apprenant/catalogue', component: Catalogue },
  { path: 'apprenant/quiz', component: Quiz },
  { path: 'apprenant/resultats', component: Resultats },
  { path: 'apprenant/certificats', component: Certificats },
  { path: 'apprenant/forum', component: Forum },
  { path: 'apprenant/notifications', component: Notifications },
  { path: 'apprenant/profil', component: Profil },

  // Page affichée à l'ouverture de l'application
  {
    path: '',
    redirectTo: 'apprenant/dashboard',
    pathMatch: 'full',
  },
];
