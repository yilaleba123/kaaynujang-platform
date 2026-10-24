import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnerApiService } from '../../api/learner-api-service';
import { CoursCatalogue } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-mes-cours',
  styleUrl: './mes-cours.css',
  templateUrl: './mes-cours.html',
})
export class MesCours {
  private readonly api = inject(LearnerApiService);

  protected readonly mesCours = signal<CoursCatalogue[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.api.getMyCourses().subscribe({
      next: courses => {
        this.mesCours.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
