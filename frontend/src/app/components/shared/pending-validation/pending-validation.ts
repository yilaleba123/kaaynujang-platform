import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-pending-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-validation.html',
  styleUrl: './pending-validation.scss',
})
export class PendingValidationComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: any = null;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
