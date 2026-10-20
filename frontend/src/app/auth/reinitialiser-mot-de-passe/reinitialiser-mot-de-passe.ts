import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';
import { PasswordRules } from '../password-rules/password-rules';
import { matchPasswords, strongPassword } from '../password-utils';

@Component({
  selector: 'app-reinitialiser-mot-de-passe',
  imports: [ReactiveFormsModule, RouterLink, PasswordRules],
  templateUrl: './reinitialiser-mot-de-passe.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReinitialiserMotDePasse {
  private readonly auth = inject(AuthService);
  readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');

  readonly loading = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group(
    { password: ['', [Validators.required, strongPassword]], confirm: ['', Validators.required] },
    { validators: matchPasswords() },
  );
  readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  submit() {
    if (this.form.invalid || !this.token) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: () => { this.loading.set(false); this.done.set(true); },
      error: () => { this.loading.set(false); this.error.set('Lien invalide ou expiré. Refaites une demande.'); },
    });
  }
}