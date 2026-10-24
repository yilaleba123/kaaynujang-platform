import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LearnerApiService } from '../../api/learner-api-service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-profil',
  styleUrl: './profil.css',
  templateUrl: './profil.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profil {
  private readonly api = inject(LearnerApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly email = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    bio: [''],
  });

  constructor() {
    this.api.getProfile().subscribe({
      next: profile => {
        this.email.set(profile.email);
        this.form.patchValue({
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone ?? '',
          bio: profile.bio ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.success.set(false);
    this.error.set(false);
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: profile => {
        this.email.set(profile.email);
        this.success.set(true);
        this.saving.set(false);
      },
      error: () => {
        this.error.set(true);
        this.saving.set(false);
      },
    });
  }
}
