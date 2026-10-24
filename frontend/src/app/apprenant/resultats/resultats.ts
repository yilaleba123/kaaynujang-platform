import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LearnerApiService, LearnerResult } from '../../api/learner-api-service';

@Component({
  imports: [DatePipe],
  selector: 'app-resultats',
  styleUrl: './resultats.css',
  templateUrl: './resultats.html',
})
export class Resultats {
  private readonly api = inject(LearnerApiService);
  protected readonly results = signal<LearnerResult[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.api.getResults().subscribe({
      next: results => {
        this.results.set(results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
