import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'Au moins 8 caractères', test: v => v.length >= 8 },
  { label: 'Au moins une majuscule', test: v => /[A-Z]/.test(v) },
  { label: 'Au moins un chiffre', test: v => /\d/.test(v) },
  { label: 'Au moins un caractère spécial', test: v => /[^A-Za-z0-9]/.test(v) },
];

export const strongPassword: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  PASSWORD_RULES.every(r => r.test(c.value ?? '')) ? null : { weak: true };

export const matchPasswords = (a = 'password', b = 'confirm'): ValidatorFn => g =>
  g.get(a)?.value === g.get(b)?.value ? null : { mismatch: true };