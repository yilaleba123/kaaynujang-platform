import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mot-de-passe-oublie.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotDePasseOublie {
  private readonly auth = inject(AuthService);
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = inject(FormBuilder).nonNullable.group({ email: ['', [Validators.required, Validators.email]] });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.error.set('Une erreur est survenue. Réessayez.'); },
    });
  }
}