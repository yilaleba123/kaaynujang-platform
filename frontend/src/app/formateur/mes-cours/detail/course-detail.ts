import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../api/api-service';
import { CourseDetail as CourseDetailModel, LessonType, Level, STATUS_CLASS, STATUS_LABEL } from '../../../api/models';
import { Icon } from '../../../shared/icon';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, NgClass, Icon],
  templateUrl: './course-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetail {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  readonly course = signal<CourseDetailModel | null>(null);
  readonly error = signal<string | null>(null);
  readonly categories = toSignal(this.api.getCategories(), { initialValue: [] });

  readonly categoryName = computed(() => this.categories().find(c => c.id === this.course()?.categoryId)?.name ?? '—');
  readonly lessonsCount = computed(() => this.course()?.modules.reduce((n, m) => n + m.lessons.length, 0) ?? 0);

  readonly statusLabel = STATUS_LABEL;
  readonly statusClass = STATUS_CLASS;
  readonly levelLabel: Record<Level, string> = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };
  readonly typeLabel: Record<LessonType, string> = { video: 'Vidéo', text: 'Texte', pdf: 'PDF' };

  constructor() {
    this.api.getCourse(this.id).subscribe({
      next: c => this.course.set(c),
      error: () => this.error.set('Cours introuvable.'),
    });
  }

  archive() {
    const c = this.course();
    if (!c || !confirm(`Archiver « ${c.title} » ?`)) return;
    this.api.archiveCourse(c.id).subscribe(() => this.router.navigate(['/formateur/mes-cours']));
  }
}