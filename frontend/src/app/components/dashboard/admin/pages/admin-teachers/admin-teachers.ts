import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-teachers.html',
  styleUrl: './admin-teachers.scss',
})
export class AdminTeachersComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  teachers: AdminUser[] = [];
  filteredTeachers: AdminUser[] = [];
  isLoading = true;

  searchQuery = '';
  statusFilter: 'ALL' | 'VALID' | 'PENDING' = 'ALL';

  // Modales
  selectedTeacher: AdminUser | null = null;
  documentType: 'CV' | 'DIPLOMA' = 'CV';
  showDocModal = false;
  showDetailModal = false;

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.isLoading = true;
    this.adminService.getUsers('ENSEIGNANT').subscribe({
      next: (data) => {
        this.teachers = data || [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.filteredTeachers = this.teachers.filter((teacher) => {
      if (teacher.role && teacher.role !== 'ENSEIGNANT') return false;

      const searchTarget =
        `${teacher.first_name || ''} ${teacher.last_name || ''} ${teacher.username} ${teacher.email} ${teacher.profile?.specialite || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(this.searchQuery.toLowerCase());

      if (this.statusFilter === 'VALID') return matchesSearch && teacher.est_valide;
      if (this.statusFilter === 'PENDING') return matchesSearch && !teacher.est_valide;

      return matchesSearch;
    });
  }

  validateTeacher(teacher: AdminUser): void {
    this.adminService.validateUser(teacher.id).subscribe({
      next: () => {
        teacher.est_valide = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        teacher.est_valide = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
    });
  }

  rejectTeacher(teacher: AdminUser): void {
    if (
      confirm(`Voulez-vous rejeter la candidature de ${teacher.first_name || teacher.username} ?`)
    ) {
      this.adminService.rejectUser(teacher.id).subscribe({
        next: () => {
          this.teachers = this.teachers.filter((t) => t.id !== teacher.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.teachers = this.teachers.filter((t) => t.id !== teacher.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  invalidateTeacher(teacher: AdminUser): void {
    if (confirm(`Voulez-vous suspendre le compte de ${teacher.username} ?`)) {
      this.adminService.invalidateUser(teacher.id).subscribe({
        next: () => {
          teacher.est_valide = false;
          this.applyFilters();
          this.cdr.detectChanges();
        },
      });
    }
  }

  // Modale prévisualisation
  openDocumentModal(teacher: AdminUser, type: 'CV' | 'DIPLOMA'): void {
    this.selectedTeacher = teacher;
    this.documentType = type;
    this.showDocModal = true;
  }

  closeDocumentModal(): void {
    this.showDocModal = false;
    this.selectedTeacher = null;
  }

  // Modale Analyse détaillée
  openDetailModal(teacher: AdminUser): void {
    this.selectedTeacher = teacher;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedTeacher = null;
  }

  // Téléchargement direct de fichier
  downloadFile(fileUrl?: string, filename?: string): void {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
