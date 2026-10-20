import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../api/api-service';
import { SubmissionDetail } from '../../../api/models';

@Component({
  selector: 'app-correction',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './correction.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Correction {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  readonly sub = signal<SubmissionDetail | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    grade: [0, [Validators.required, Validators.min(0)]],
    comment: [''],
  });

  constructor() {
    this.api.getSubmission(this.id).subscribe({
      next: s => {
        this.sub.set(s);
        this.form.controls.grade.setValidators([Validators.required, Validators.min(0), Validators.max(s.maxGrade)]);
        this.form.patchValue({ grade: s.grade ?? 0, comment: s.comment ?? '' });
      },
      error: () => this.error.set('Copie introuvable.'),
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.gradeSubmission(this.id, this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/formateur/copies']),
      error: () => { this.saving.set(false); this.error.set("La note n'a pas pu être enregistrée."); },
    });
  }
}