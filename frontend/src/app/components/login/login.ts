import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.authService.login(this.credentials.username, this.credentials.password).subscribe({
      next: (response) => {
        this.router.navigate([
          response.role === 'APPRENANT' ? '/apprenant/dashboard' : '/formateur',
        ]);
      },
      error: () => {
        this.errorMessage = 'Identifiants incorrects ou compte inactif.';
      },
    });
  }
}
