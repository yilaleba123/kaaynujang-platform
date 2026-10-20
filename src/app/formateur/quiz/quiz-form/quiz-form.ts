import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../api/api-service';
import { QuizQuestion } from '../../../api/models';
import { Icon } from '../../../shared/icon';

@Component({
  selector: 'app-quiz-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './quiz-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizForm {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly quizId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly courses = toSignal(this.api.getCourses(), { initialValue: [] });
  readonly saving = signal(false);
  readonly loading = signal(!!this.quizId);
  readonly error = signal<string | null>(null);

  optionControl(v = '') { return this.fb.nonNullable.control(v, Validators.required); }
  questionGroup(q?: QuizQuestion) {
    return this.fb.nonNullable.group({
      text: [q?.text ?? '', Validators.required],
      correctIndex: [q?.correctIndex ?? 0],
      options: this.fb.array(q ? q.options.map(o => this.optionControl(o)) : [this.optionControl(), this.optionControl()]),
    });
  }

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    courseId: ['', Validators.required],
    durationMinutes: [15, [Validators.required, Validators.min(1)]],
    questions: this.fb.array([this.questionGroup()]),
  });

  constructor() {
    if (this.quizId) {
      this.api.getQuiz(this.quizId).subscribe({
        next: q => {
          this.form.controls.questions.clear();
          q.questions.forEach(x => this.form.controls.questions.push(this.questionGroup(x)));
          this.form.patchValue({ title: q.title, courseId: q.courseId, durationMinutes: q.durationMinutes });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.error.set('Quiz introuvable.'); },
      });
    }
  }

  addQuestion() { this.form.controls.questions.push(this.questionGroup()); }
  removeQuestion(i: number) { this.form.controls.questions.removeAt(i); }
  addOption(qi: number) { this.form.controls.questions.at(qi).controls.options.push(this.optionControl()); }
  removeOption(qi: number, oi: number) {
    const q = this.form.controls.questions.at(qi);
    q.controls.options.removeAt(oi);
    if (q.controls.correctIndex.value >= q.controls.options.length) q.controls.correctIndex.setValue(0);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set(null);
    const payload = this.form.getRawValue();
    const req = this.quizId ? this.api.updateQuiz(this.quizId, payload) : this.api.createQuiz(payload);
    req.subscribe({
      next: () => this.router.navigate(['/formateur/quiz']),
      error: () => { this.saving.set(false); this.error.set("L'enregistrement du quiz a échoué."); },
    });
  }
}