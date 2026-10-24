import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-featured-courses',
  standalone: true, // Composant autonome (pas besoin de NgModule)
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './featured-courses.html',
  styleUrl: './featured-courses.scss',
})
export class FeaturedCoursesComponent {
  /**
   * Données des cours présentés aux visiteurs non authentifiés.
   * Règle métier : Résumé haut niveau uniquement (titre, niveau, durée).
   * Aucun lien direct vers les fichiers ou documents de cours.
   */
  featuredCourses = [
    {
      category: 'PROGRAMMATION',
      title: 'Développement Web Fullstack',
      level: 'Débutant à Avancé',
      duration: '12 semaines',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&auto=format',
    },
    {
      category: 'BUSINESS',
      title: 'Marketing Digital & Réseaux Sociaux',
      level: 'Intermédiaire',
      duration: '8 semaines',
      image:
        'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&h=400&fit=crop&auto=format',
    },
    {
      category: 'TECH',
      title: 'Bases de données et Cloud Computing',
      level: 'Avancé',
      duration: '10 semaines',
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&auto=format',
    },
  ];
}
