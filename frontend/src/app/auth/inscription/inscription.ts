import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { AuthService } from '../auth-service';
import { FileDrop } from '../file-drop/file-drop';
import { PasswordRules } from '../password-rules/password-rules';
import { matchPasswords, strongPassword } from '../password-utils';

type SignupRole = 'student' | 'teacher';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink, Icon, FileDrop, PasswordRules],
  templateUrl: './inscription.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inscription {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly role = signal<SignupRole>('student');
  readonly document = signal<File | null>(null); // diplôme (étudiant) ou CV (enseignant)
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly done = signal<SignupRole | null>(null);
  readonly showPwd = signal(false);
  readonly showConfirm = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      speciality: [''], // requis seulement pour un enseignant
      trainingCenter: [''],
      password: ['', [Validators.required, strongPassword]],
      confirm: ['', Validators.required],
    },
    { validators: matchPasswords() },
  );

  readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  setRole(r: SignupRole) {
    this.role.set(r);
    this.document.set(null); // le type de document change
    const c = this.form.controls.speciality;
    c.setValidators(r === 'teacher' ? [Validators.required] : []);
    c.updateValueAndValidity();
  }

  submit() {
    this.submitted.set(true);
    if (this.form.invalid || !this.document()) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('role', this.role());
    fd.append('lastName', v.lastName);
    fd.append('firstName', v.firstName);
    fd.append('email', v.email);
    fd.append('password', v.password);
    if (v.trainingCenter) fd.append('trainingCenter', v.trainingCenter);
    if (this.role() === 'teacher') fd.append('speciality', v.speciality);
    fd.append('document', this.document()!); // diplôme ou CV

    this.loading.set(true);
    this.error.set(null);
    this.auth.register(fd).subscribe({
      next: () => { this.loading.set(false); this.done.set(this.role()); },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(e.status === 409 ? 'Cette adresse e-mail est déjà utilisée.'
          : e.status === 0 ? 'Serveur injoignable. Réessayez plus tard.'
          : "L'inscription a échoué. Vérifiez les informations et réessayez.");
      },
    });
  }
}