import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LearnerApiService } from '../../api/learner-api-service';
import { CoursCatalogue } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-catalogue',
  styleUrl: './catalogue.css',
  templateUrl: './catalogue.html',
})
export class Catalogue {
  private readonly api = inject(LearnerApiService);
  protected readonly coursDisponibles = signal<CoursCatalogue[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  // Texte saisi dans la recherche.
  protected readonly recherche = signal('');

  // Niveau sélectionné dans le filtre.
  protected readonly niveauSelectionne = signal('Tous');

  // Cours correspondant à la recherche et au niveau sélectionné.
  protected readonly coursFiltres = computed(() => {
    const texte = this.recherche().trim().toLocaleLowerCase('fr');
    const niveau = this.niveauSelectionne();

    return this.coursDisponibles().filter((cours) => {
      const correspondAuTitre = cours.titre
        .toLocaleLowerCase('fr')
        .includes(texte);

      const correspondAuNiveau =
        niveau === 'Tous' || cours.niveau === niveau;

      return correspondAuTitre && correspondAuNiveau;
    });
  });

  constructor() {
    this.api.getCatalogue().subscribe({
      next: courses => {
        this.coursDisponibles.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
