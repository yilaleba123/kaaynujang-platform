import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURS_DEMONSTRATION } from '../cours.data';
import { InscriptionService } from '../inscription.service';

@Component({
  imports: [RouterLink],
  selector: 'app-mes-cours',
  styleUrl: './mes-cours.css',
  templateUrl: './mes-cours.html',
})
export class MesCours {
  // Service qui contient les inscriptions locales.
  private readonly inscriptionService = inject(InscriptionService);

  // Cours auxquels l'apprenant est inscrit.
  protected readonly mesCours = computed(() => {
    const coursInscrits = this.inscriptionService.obtenirCoursInscrits();

    return COURS_DEMONSTRATION.filter((cours) =>
      coursInscrits.includes(cours.id)
    );
  });
}
