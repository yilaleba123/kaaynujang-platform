import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedRole: 'APPRENANT' | 'ENSEIGNANT' = 'APPRENANT';
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;

  selectedDiplomaFile: File | null = null;
  selectedCvFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      lastName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      specialty: [''],
      trainingCenter: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  setRole(role: 'APPRENANT' | 'ENSEIGNANT'): void {
    this.selectedRole = role;
    const specialtyControl = this.registerForm.get('specialty');
    if (role === 'ENSEIGNANT') {
      specialtyControl?.setValidators([Validators.required]);
    } else {
      specialtyControl?.clearValidators();
    }
    specialtyControl?.updateValueAndValidity();
  }

  onDiplomaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedDiplomaFile = input.files[0];
    }
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCvFile = input.files[0];
    }
  }

  // Vérifications dynamiques du mot de passe
  get hasMinLength(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return pass.length >= 8;
  }

  get hasUppercase(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(pass);
  }

  get hasNumber(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(pass);
  }

  get hasSpecialChar(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[^A-Za-z0-9]/.test(pass);
  }

  get passwordsMatch(): boolean {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return pass && confirm ? pass === confirm : true;
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires du formulaire.';
      return;
    }

    if (!this.passwordsMatch) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.selectedRole === 'APPRENANT' && !this.selectedDiplomaFile) {
      this.errorMessage = 'Veuillez joindre votre dernier diplôme ou attestation.';
      return;
    }

    if (this.selectedRole === 'ENSEIGNANT' && !this.selectedCvFile) {
      this.errorMessage = 'Veuillez téléverser votre CV au format PDF.';
      return;
    }

    this.isLoading = true;

    // Construction de l'objet FormData
    const formData = new FormData();
    formData.append('last_name', this.registerForm.get('lastName')?.value);
    formData.append('first_name', this.registerForm.get('firstName')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('role', this.selectedRole);
    formData.append('centre_formation', this.registerForm.get('trainingCenter')?.value || '');

    if (this.selectedRole === 'ENSEIGNANT') {
      formData.append('specialite', this.registerForm.get('specialty')?.value || '');
      if (this.selectedCvFile) {
        formData.append('cv', this.selectedCvFile);
      }
    } else if (this.selectedRole === 'APPRENANT' && this.selectedDiplomaFile) {
      formData.append('diplome', this.selectedDiplomaFile);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = true;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && typeof err.error === 'object') {
          const firstKey = Object.keys(err.error)[0];
          this.errorMessage = `${firstKey}: ${err.error[firstKey]}`;
        } else {
          this.errorMessage = "Une erreur est survenue lors de l'inscription.";
        }
      },
    });
  }
}
