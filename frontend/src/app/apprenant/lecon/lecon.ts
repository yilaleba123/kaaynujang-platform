import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { COURS_DEMONSTRATION } from '../cours.data';
import { InscriptionService } from '../inscription.service';

@Component({
  imports: [RouterLink],
  selector: 'app-lecon',
  styleUrl: './lecon.css',
  templateUrl: './lecon.html',
})
export class Lecon {
  // Informations de la route actuelle.
  private readonly route = inject(ActivatedRoute);

  // Service qui contient les inscriptions.
  private readonly inscriptionService = inject(InscriptionService);

  // Paramètres présents dans l'adresse.
  private readonly parametres = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  // Cours auquel appartient la leçon.
  protected readonly cours = computed(() => {
    const coursId = Number(this.parametres().get('coursId'));

    return COURS_DEMONSTRATION.find((cours) => cours.id === coursId);
  });

  // Vérifie si l'apprenant est inscrit au cours.
  protected readonly estInscrit = computed(() => {
    const coursSelectionne = this.cours();

    return coursSelectionne
      ? this.inscriptionService.estInscrit(coursSelectionne.id)
      : false;
  });

  // Leçon sélectionnée dans le cours.
  protected readonly lecon = computed(() => {
    const leconId = Number(this.parametres().get('leconId'));
    const modules = this.cours()?.modules ?? [];

    return modules
      .flatMap((module) => module.lecons)
      .find((lecon) => lecon.id === leconId);
  });
}
