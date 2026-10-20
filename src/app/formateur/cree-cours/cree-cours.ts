import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../api/api-service';
import { CourseModule, Lesson, LessonType, Level } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-cree-cours',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './cree-cours.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreeCours {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly courseId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly categories = toSignal(this.api.getCategories(), { initialValue: [] });
  readonly saving = signal(false);
  readonly loading = signal(!!this.courseId);
  readonly error = signal<string | null>(null);

  readonly levels: { value: Level; label: string }[] = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
  ];
  readonly lessonTypes: { value: LessonType; label: string }[] = [
    { value: 'video', label: 'Vidéo' },
    { value: 'text', label: 'Texte' },
    { value: 'pdf', label: 'PDF' },
  ];

  lessonGroup(l?: Lesson) {
    return this.fb.nonNullable.group({
      title: [l?.title ?? '', Validators.required],
      type: [l?.type ?? ('video' as LessonType)],
      contentUrl: [l?.contentUrl ?? ''],
    });
  }
  moduleGroup(m?: CourseModule) {
    return this.fb.nonNullable.group({
      title: [m?.title ?? '', Validators.required],
      lessons: this.fb.array(m?.lessons.map(l => this.lessonGroup(l)) ?? [this.lessonGroup()]),
    });
  }

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    categoryId: ['', Validators.required],
    level: ['beginner' as Level, Validators.required],
    description: ['', Validators.required],
    modules: this.fb.array([this.moduleGroup()]),
  });

  constructor() {
    if (this.courseId) {
      this.api.getCourse(this.courseId).subscribe({
        next: c => {
          this.form.controls.modules.clear();
          c.modules.forEach(m => this.form.controls.modules.push(this.moduleGroup(m)));
          this.form.patchValue({ title: c.title, categoryId: c.categoryId, level: c.level, description: c.description });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.error.set('Cours introuvable.'); },
      });
    }
  }

  addModule() { this.form.controls.modules.push(this.moduleGroup()); }
  removeModule(i: number) { this.form.controls.modules.removeAt(i); }
  addLesson(mi: number) { this.form.controls.modules.at(mi).controls.lessons.push(this.lessonGroup()); }
  removeLesson(mi: number, li: number) { this.form.controls.modules.at(mi).controls.lessons.removeAt(li); }

  submit(status: 'draft' | 'published') {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set(null);
    const payload = { ...this.form.getRawValue(), status };
    const req = this.courseId ? this.api.updateCourse(this.courseId, payload) : this.api.createCourse(payload);
    req.subscribe({
      next: () => this.router.navigate(['/formateur/mes-cours']),
      error: () => { this.saving.set(false); this.error.set("L'enregistrement du cours a échoué."); },
    });
  }
}