import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiService } from '../../api/api-service';

interface Msg { ok: boolean; text: string; }

function sameAs(g: AbstractControl): ValidationErrors | null {
  return g.get('newPassword')?.value === g.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-profil',
  imports: [ReactiveFormsModule],
  templateUrl: './profil.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profil {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly email = signal('');
  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly savingPwd = signal(false);
  readonly profileMsg = signal<Msg | null>(null);
  readonly pwdMsg = signal<Msg | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    bio: [''],
  });

  readonly pwdForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: sameAs },
  );

  constructor() {
    this.api.getProfile().subscribe({
      next: p => {
        this.email.set(p.email);
        this.profileForm.patchValue({ firstName: p.firstName, lastName: p.lastName, phone: p.phone ?? '', bio: p.bio ?? '' });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.profileMsg.set({ ok: false, text: 'Impossible de charger le profil.' }); },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.profileMsg.set(null);
    this.api.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => { this.savingProfile.set(false); this.profileMsg.set({ ok: true, text: 'Profil mis à jour.' }); },
      error: () => { this.savingProfile.set(false); this.profileMsg.set({ ok: false, text: 'La mise à jour a échoué.' }); },
    });
  }

  savePassword() {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    this.savingPwd.set(true);
    this.pwdMsg.set(null);
    const { currentPassword, newPassword } = this.pwdForm.getRawValue();
    this.api.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => { this.savingPwd.set(false); this.pwdForm.reset(); this.pwdMsg.set({ ok: true, text: 'Mot de passe modifié.' }); },
      error: () => { this.savingPwd.set(false); this.pwdMsg.set({ ok: false, text: 'Mot de passe actuel incorrect ou changement refusé.' }); },
    });
  }
}