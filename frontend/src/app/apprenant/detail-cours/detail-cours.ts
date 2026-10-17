import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { COURS_DEMONSTRATION } from '../cours.data';
import { InscriptionService } from '../inscription.service';

@Component({
  imports: [RouterLink],
  selector: 'app-detail-cours',
  styleUrl: './detail-cours.css',
  templateUrl: './detail-cours.html',
})
export class DetailCours {
  // Informations de la route actuelle.
  private readonly route = inject(ActivatedRoute);

  // Service qui gère les inscriptions.
  protected readonly inscriptionService = inject(InscriptionService);

  // Paramètres présents dans l'adresse.
  private readonly parametres = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  // Cours correspondant à l'identifiant dans l'adresse.
  protected readonly cours = computed(() => {
    const id = Number(this.parametres().get('id'));

    return COURS_DEMONSTRATION.find((cours) => cours.id === id);
  });

  // Vérifie si l'apprenant est déjà inscrit au cours.
  protected readonly estInscrit = computed(() => {
    const coursSelectionne = this.cours();

    return coursSelectionne
      ? this.inscriptionService.estInscrit(coursSelectionne.id)
      : false;
  });

  // Inscrit l'apprenant au cours sélectionné.
  protected inscrireAuCours(): void {
    const coursSelectionne = this.cours();

    if (coursSelectionne) {
      this.inscriptionService.inscrire(coursSelectionne.id);
    }
  }
}
