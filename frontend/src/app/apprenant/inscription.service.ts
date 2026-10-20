import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InscriptionService {
  // Liste des identifiants des cours suivis.
  private readonly coursInscrits = signal<number[]>([]);

  // Vérifie si l'apprenant est inscrit à un cours.
  estInscrit(coursId: number): boolean {
    return this.coursInscrits().includes(coursId);
  }

  // Ajoute un cours à la liste des cours suivis.
  inscrire(coursId: number): void {
    if (!this.estInscrit(coursId)) {
      this.coursInscrits.update((cours) => [...cours, coursId]);
    }
  }

  // Retourne la liste des cours suivis.
  obtenirCoursInscrits(): number[] {
    return this.coursInscrits();
  }
}
