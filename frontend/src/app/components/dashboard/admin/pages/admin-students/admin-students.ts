import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-students.html',
  styleUrl: './admin-students.scss',
})
export class AdminStudentsComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  students: AdminUser[] = [];
  filteredStudents: AdminUser[] = [];
  isLoading = true;

  searchQuery = '';
  statusFilter: 'ALL' | 'VALID' | 'PENDING' = 'ALL';

  selectedStudent: AdminUser | null = null;
  showDetailModal = false;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.adminService.getUsers('APPRENANT').subscribe({
      next: (data) => {
        this.students = data || [];
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
    this.filteredStudents = this.students.filter((student) => {
      if (student.role && student.role !== 'APPRENANT') return false;

      const fullName =
        `${student.first_name || ''} ${student.last_name || ''} ${student.username} ${student.email}`.toLowerCase();
      const matchesSearch = fullName.includes(this.searchQuery.toLowerCase());

      if (this.statusFilter === 'VALID') return matchesSearch && student.est_valide;
      if (this.statusFilter === 'PENDING') return matchesSearch && !student.est_valide;

      return matchesSearch;
    });
  }

  validateStudent(student: AdminUser): void {
    this.adminService.validateUser(student.id).subscribe({
      next: () => {
        student.est_valide = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        student.est_valide = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
    });
  }

  rejectStudent(student: AdminUser): void {
    if (
      confirm(`Voulez-vous rejeter l'inscription de ${student.first_name || student.username} ?`)
    ) {
      this.adminService.rejectUser(student.id).subscribe({
        next: () => {
          this.students = this.students.filter((s) => s.id !== student.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.students = this.students.filter((s) => s.id !== student.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  invalidateStudent(student: AdminUser): void {
    if (confirm(`Voulez-vous suspendre le compte de ${student.username} ?`)) {
      this.adminService.invalidateUser(student.id).subscribe({
        next: () => {
          student.est_valide = false;
          this.applyFilters();
          this.cdr.detectChanges();
        },
      });
    }
  }

  openDetailModal(student: AdminUser): void {
    this.selectedStudent = student;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedStudent = null;
  }

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
