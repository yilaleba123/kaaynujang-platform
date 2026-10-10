import { Component, signal } from '@angular/core';
 import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],

  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',

  // Fermeture du menu avec Échap
  host: {
    '(document:keydown.escape)': 'menuOuvert.set(false)',
  },
})
export class Dashboard {
  // Username fourni par la connexion
  // Username de test
protected readonly username = signal<string | null>('Fatima');


// Message selon l'heure locale
protected readonly salutation = (() => {
  const heure = new Date().getHours();

  return heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour';
})();


  // État du menu latéral
  protected readonly menuOuvert = signal(false);

  // Cours de démonstration
  protected readonly coursAReprendre = {
    titre: 'Introduction au Marketing Digital',
    module: 'Le cours n’a pas encore été commencé',
    progression: 0,
  };

  // Liste de cours de démonstration
  protected readonly coursEnCours = [
    {
      id: 1,
      titre: 'Introduction au Marketing Digital',
      formateur: 'Awa Diop',
      progression: 0,
    },
    {
      id: 2,
      titre: 'Développement Web React',
      formateur: 'Cheikh Ndiaye',
      progression: 0,
    },
    {
      id: 3,
      titre: 'Design Thinking',
      formateur: 'Fatou Sow',
      progression: 0,
    },
  ];

  // Évaluations de démonstration
  protected readonly evaluations = [
    {
      id: 1,
      titre: 'Quiz React Hooks',
      cours: 'Développement Web React',
      echeance: 'Demain, 23:59',
    },
    {
      id: 2,
      titre: 'QCM Stratégie SEO',
      cours: 'Introduction au Marketing Digital',
      echeance: 'Dans 3 jours',
    },
    {
      id: 3,
      titre: 'Rendu Prototype',
      cours: 'Design Thinking',
      echeance: 'Semaine prochaine',
    },
  ];

  // Activité initiale
  protected readonly activiteHebdomadaire = [
    { jour: 'Lun', heures: 0 },
    { jour: 'Mar', heures: 0 },
    { jour: 'Mer', heures: 0 },
    { jour: 'Jeu', heures: 0 },
    { jour: 'Ven', heures: 0 },
    { jour: 'Sam', heures: 0 },
    { jour: 'Dim', heures: 0 },
  ];
}
