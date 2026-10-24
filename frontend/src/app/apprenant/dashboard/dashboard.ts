import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearnerApiService, LearnerQuiz, LearnerResult } from '../../api/learner-api-service';
import { CoursCatalogue } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
  host: {
    '(document:keydown.escape)': 'menuOuvert.set(false)',
  },
})
export class Dashboard {
  private readonly api = inject(LearnerApiService);

  protected readonly username = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly menuOuvert = signal(false);
  private readonly tousLesCours = signal<CoursCatalogue[]>([]);
  protected readonly coursEnCours = computed(
    () => this.tousLesCours().filter(course => (course.progression ?? 0) < 100),
  );
  protected readonly evaluations = signal<LearnerQuiz[]>([]);
  protected readonly results = signal<LearnerResult[]>([]);
  protected readonly certificateCount = signal<number | null>(null);

  protected readonly salutation = (() => {
    const heure = new Date().getHours();
    return heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour';
  })();

  protected readonly coursAReprendre = computed(() => this.coursEnCours()[0] ?? null);
  protected readonly coursTermines = computed(
    () => this.tousLesCours().filter(course => (course.progression ?? 0) === 100).length,
  );
  protected readonly averageGrade = computed(() => {
    const graded = this.results().filter(result => result.grade !== null);
    return graded.length
      ? Math.round(graded.reduce((sum, result) => sum + (result.grade ?? 0), 0) / graded.length)
      : null;
  });

  constructor() {
    this.api.getProfile().subscribe({
      next: profile => {
        this.username.set(profile.first_name || profile.username);
      },
      error: () => this.error.set(true),
    });
    this.api.getMyCourses().subscribe({
      next: courses => {
        this.tousLesCours.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
    this.api.getQuizzes().subscribe({
      next: quizzes => this.evaluations.set(quizzes),
      error: () => this.error.set(true),
    });
    this.api.getResults().subscribe({
      next: results => this.results.set(results),
      error: () => this.error.set(true),
    });
    this.api.getCertificates().subscribe({
      next: certificates => this.certificateCount.set(certificates.length),
      error: () => this.error.set(true),
    });
  }
}
