import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LearnerApiService } from '../../api/learner-api-service';
import { CoursCatalogue, Lecon as LessonData } from '../cours.data';

@Component({
  imports: [RouterLink],
  selector: 'app-lecon',
  styleUrl: './lecon.css',
  templateUrl: './lecon.html',
})
export class Lecon {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(LearnerApiService);

  protected readonly cours = signal<CoursCatalogue | null>(null);
  protected readonly lecon = signal<LessonData | null>(null);
  protected readonly loading = signal(true);
  protected readonly estInscrit = signal(false);
  protected readonly savingProgress = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const courseId = Number(this.route.snapshot.paramMap.get('coursId'));
    const lessonId = Number(this.route.snapshot.paramMap.get('leconId'));
    if (!Number.isInteger(courseId) || courseId < 1 || !Number.isInteger(lessonId) || lessonId < 1) {
      this.loading.set(false);
      return;
    }
    this.api.getCourse(courseId).subscribe({
      next: course => {
        this.cours.set(course);
        this.estInscrit.set(!!course.est_inscrit);
        const lesson = course.modules
          ?.flatMap(module => module.lecons)
          .find(item => item.id === lessonId) ?? null;
        this.lecon.set(lesson);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('La leçon n’a pas pu être chargée.');
        this.loading.set(false);
      },
    });
  }

  protected terminerLecon(): void {
    const lesson = this.lecon();
    if (!lesson || lesson.completed || this.savingProgress()) return;
    this.savingProgress.set(true);
    this.api.completeLesson(lesson.id).subscribe({
      next: () => {
        this.lecon.update(current => current ? { ...current, completed: true } : current);
        this.savingProgress.set(false);
      },
      error: () => {
        this.error.set('La progression n’a pas pu être enregistrée.');
        this.savingProgress.set(false);
      },
    });
  }
}
