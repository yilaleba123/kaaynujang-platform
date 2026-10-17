// Contenu d'une leçon.
export interface Lecon {
  id: number;
  titre: string;
  contenu: string;
}

// Groupe de leçons du cours.
export interface ModuleCours {
  id: number;
  titre: string;
  lecons: Lecon[];
}

// Informations utilisées pour afficher un cours.
export interface CoursCatalogue {
  id: number;
  titre: string;
  description: string;
  image: string;
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé';
  modules?: ModuleCours[];
}

// Données de démonstration partagées entre les pages.
export const COURS_DEMONSTRATION: CoursCatalogue[] = [
  {
    id: 1,
    titre: 'Développement Web Full-Stack',
    description:
      'Découvrez comment créer une application web, de son interface à son serveur.',
    image: 'images/developpement-web.jpg',
    niveau: 'Intermédiaire',
    modules: [
  {
    id: 1,
    titre: 'Découvrir le développement web',
    lecons: [
      {
        id: 1,
        titre: 'Comprendre le fonctionnement d’un site',
        contenu:
          'Un site web est consulté depuis un navigateur. Le frontend correspond à la partie visible et interactive du site. Le backend traite les demandes et peut communiquer avec une base de données.',
      },
      {
        id: 2,
        titre: 'Découvrir HTML, CSS et JavaScript',
        contenu:
          'HTML structure le contenu d’une page. CSS définit sa présentation : couleurs, tailles et disposition. JavaScript permet d’ajouter des comportements interactifs.',
      },
    ],
  },
  {
    id: 2,
    titre: 'Créer une première page',
    lecons: [
      {
        id: 3,
        titre: 'Structurer le contenu',
        contenu:
          'Pour organiser une page, on peut utiliser un titre principal, des paragraphes et des sections. Les éléments HTML donnent un sens au contenu et facilitent sa compréhension.',
      },
      {
        id: 4,
        titre: 'Mettre la page en forme',
        contenu:
          'Une feuille CSS permet de modifier la présentation des éléments HTML. On peut notamment définir une couleur de texte, une couleur de fond, des marges et des espacements.',
      },
    ],
  },
],
  },

  
  {
    id: 2,
    titre: 'Marketing Digital Panafricain',
    description:
      'Découvrez les bases du marketing digital et les stratégies de communication en ligne.',
    image: 'images/marketing-digital.jpg',
    niveau: 'Débutant',
    
  },
  {
    id: 3,
    titre: 'Gestion de Projet Agile',
    description:
      'Apprenez à organiser un projet et à travailler en équipe avec les méthodes agiles.',
    image: 'images/gestion-projet.jpg',
    niveau: 'Avancé',

  },
  {
    id: 4,
    titre: 'Initiation à l’intelligence artificielle',
    description:
      'Découvrez les bases de l’intelligence artificielle, ses usages et ses limites.',
    image: 'images/developpement-web.jpg',
    niveau: 'Débutant',

  },
];
