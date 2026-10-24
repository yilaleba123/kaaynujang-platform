import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService, AdminUser, AuditLogItem } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
})
export class AdminHomeComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Statistiques
  totalStudents = 0;
  totalTeachers = 0;
  pendingValidation = 0;
  publishedCourses = 3;

  // Listes
  pendingUsers: AdminUser[] = [];
  recentLogs: AuditLogItem[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Récupération globale des utilisateurs
    this.adminService.getUsers().subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          // Filtrage et calculs statistiques dynamiques
          this.pendingUsers = users.filter((u) => !u.est_valide);
          this.pendingValidation = this.pendingUsers.length;
          this.totalStudents = users.filter((u) => u.role === 'APPRENANT').length;
          this.totalTeachers = users.filter((u) => u.role === 'ENSEIGNANT').length;
        } else {
          // Valeurs de secours si la BDD n'a pas encore renvoyé d'utilisateurs
          this.pendingUsers = [];
          this.pendingValidation = 0;
          this.totalStudents = 0;
          this.totalTeachers = 0;
        }

        this.isLoading = false;
        this.cdr.detectChanges(); // Rafraîchissement instantané de la vue
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    // Chargement du journal d'activité
    this.adminService.getAuditLogs().subscribe({
      next: (logs) => {
        this.recentLogs = logs || [];
        this.cdr.detectChanges();
      },
    });
  }

  validateUser(user: AdminUser): void {
    this.adminService.validateUser(user.id).subscribe({
      next: () => {
        user.est_valide = true;
        this.loadDashboardData(); // Rechargement automatique des cartes
      },
    });
  }

  goToModule(route: string): void {
    this.router.navigate([route]);
  }
}
