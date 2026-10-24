import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage: string | null = null;
  isLoading = false;

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: LoginResponse) => {
        this.isLoading = false;
        const user = res.user;

        if (!user) {
          this.errorMessage = 'Erreur : données utilisateur manquantes.';
          return;
        }

        // Sécurité : Stockage direct avant la navigation
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          localStorage.setItem('current_user', JSON.stringify(user));
        }

        // Redirection si le compte n'est pas validé (sauf ADMIN)
        if (!user.est_valide && user.role !== 'ADMIN') {
          this.router.navigate(['/pending-validation']);
          return;
        }

        // Détermination de la route cible selon le rôle
        let targetRoute = '/dashboard/student';
        if (user.role === 'ADMIN') {
          targetRoute = '/dashboard/admin';
        } else if (user.role === 'ENSEIGNANT') {
          targetRoute = '/dashboard/teacher';
        }

        // Navigation avec promesse de suivi
        this.router.navigate([targetRoute]).then((success) => {
          if (!success) {
            console.error('Navigation Angular refusée vers :', targetRoute);
            this.errorMessage = 'Accès au tableau de bord refusé par le système de sécurité.';
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = err.error?.detail || 'Identifiants incorrects.';
        } else if (err.status === 0) {
          this.errorMessage =
            'Impossible de contacter le serveur backend. Vérifiez que Django tourne.';
        } else {
          this.errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer ultérieurement.';
        }
      },
    });
  }
}
