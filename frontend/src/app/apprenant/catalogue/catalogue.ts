import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURS_DEMONSTRATION } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-catalogue',
  styleUrl: './catalogue.css',
  templateUrl: './catalogue.html',
})
export class Catalogue {
  // Liste partagée des cours.
  protected readonly coursDisponibles = COURS_DEMONSTRATION;

  // Texte saisi dans la recherche.
  protected readonly recherche = signal('');

  // Niveau sélectionné dans le filtre.
  protected readonly niveauSelectionne = signal('Tous');

  // Cours correspondant à la recherche et au niveau sélectionné.
  protected readonly coursFiltres = computed(() => {
    const texte = this.recherche().trim().toLocaleLowerCase('fr');
    const niveau = this.niveauSelectionne();

    return this.coursDisponibles.filter((cours) => {
      const correspondAuTitre = cours.titre
        .toLocaleLowerCase('fr')
        .includes(texte);

      const correspondAuNiveau =
        niveau === 'Tous' || cours.niveau === niveau;

      return correspondAuTitre && correspondAuNiveau;
    });
  });
}
