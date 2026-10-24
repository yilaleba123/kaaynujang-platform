import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LearnerApiService } from '../../api/learner-api-service';
import { CoursCatalogue } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-detail-cours',
  styleUrl: './detail-cours.css',
  templateUrl: './detail-cours.html',
})
export class DetailCours {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(LearnerApiService);

  protected readonly cours = signal<CoursCatalogue | null>(null);
  protected readonly loading = signal(true);
  protected readonly enrolling = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly estInscrit = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      return;
    }
    this.api.getCourse(id).subscribe({
      next: course => {
        this.cours.set(course);
        this.estInscrit.set(!!course.est_inscrit);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Ce cours est introuvable ou n’est plus disponible.');
        this.loading.set(false);
      },
    });
  }

  protected inscrireAuCours(): void {
    const course = this.cours();
    if (!course || this.enrolling() || this.estInscrit()) return;
    this.enrolling.set(true);
    this.error.set(null);
    this.api.enroll(course.id).subscribe({
      next: () => {
        this.estInscrit.set(true);
        this.enrolling.set(false);
      },
      error: () => {
        this.error.set('L’inscription au cours a échoué. Réessayez.');
        this.enrolling.set(false);
      },
    });
  }
}
