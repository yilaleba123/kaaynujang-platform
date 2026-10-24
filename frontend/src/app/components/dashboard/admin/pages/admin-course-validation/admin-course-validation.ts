import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminCourse } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-course-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-course-validation.html',
  styleUrl: './admin-course-validation.scss',
})
export class AdminCourseValidationComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  pendingCourses: AdminCourse[] = [];
  filteredCourses: AdminCourse[] = [];
  isLoading = true;

  searchQuery = '';
  selectedCourse: AdminCourse | null = null;
  showReviewModal = false;
  rejectionReason = '';
  showRejectInput = false;

  // Données démonstratives en attente de validation
  private MOCK_PENDING_COURSES: AdminCourse[] = [
    {
      id: 101,
      titre: 'Bases de données relationnelles SQL & PostgreSQL',
      description:
        'Conception de schémas relationnels, modélisation conceptuelle (UML/Merise), écriture de requêtes complexes et d indexation.',
      enseignant_name: 'Dr. Ibrahima Konaté',
      categorie: 'Informatique',
      niveau: 'Intermédiaire',
      statut: 'EN_ATTENTE',
      nombre_eleves: 0,
      created_at: '2026-10-22',
      support_cours: '/assets/docs/support-sql-postgresql.pdf',
    },
    {
      id: 102,
      titre: 'Introduction à la Microéconomie & Théorie des Jeux',
      description:
        'Analyse du comportement des agents économiques, marchés concurentiels, élasticité et équilibres de Nash.',
      enseignant_name: 'Pr. Awa Faye',
      categorie: 'Économie & Gestion',
      niveau: 'Débutant',
      statut: 'EN_ATTENTE',
      nombre_eleves: 0,
      created_at: '2026-10-23',
      support_cours: '/assets/docs/microeconomie-cours.pdf',
    },
  ];

  ngOnInit(): void {
    this.loadPendingCourses();
  }

  loadPendingCourses(): void {
    this.isLoading = true;
    this.adminService.getCourses('EN_ATTENTE').subscribe({
      next: (data) => {
        const pending = data.filter((c) => c.statut === 'EN_ATTENTE');
        this.pendingCourses = pending.length > 0 ? pending : this.MOCK_PENDING_COURSES;
        this.applySearch();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pendingCourses = this.MOCK_PENDING_COURSES;
        this.applySearch();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getCategoryName(course: AdminCourse): string {
    if (!course.categorie) return 'Général';
    if (typeof course.categorie === 'object' && course.categorie !== null) {
      const catObj = course.categorie as { id?: number; nom?: string };
      return catObj.nom || 'Général';
    }
    return String(course.categorie);
  }

  applySearch(): void {
    this.filteredCourses = this.pendingCourses.filter((course) => {
      const searchTarget =
        `${course.titre} ${course.enseignant_name || ''} ${this.getCategoryName(course)}`.toLowerCase();
      return searchTarget.includes(this.searchQuery.toLowerCase());
    });
  }

  openReviewModal(course: AdminCourse): void {
    this.selectedCourse = course;
    this.rejectionReason = '';
    this.showRejectInput = false;
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedCourse = null;
    this.showRejectInput = false;
    this.rejectionReason = '';
  }

  approveCourse(course: AdminCourse): void {
    this.adminService.updateCourseStatus(course.id, 'PUBLIE').subscribe({
      next: () => this.removeFromPendingList(course.id),
      error: () => this.removeFromPendingList(course.id),
    });
  }

  confirmRejection(course: AdminCourse): void {
    if (!this.rejectionReason.trim()) {
      alert('Veuillez préciser un motif de rejet pour le formateur.');
      return;
    }

    this.adminService.updateCourseStatus(course.id, 'REJETE').subscribe({
      next: () => this.removeFromPendingList(course.id),
      error: () => this.removeFromPendingList(course.id),
    });
  }

  private removeFromPendingList(courseId: number): void {
    this.pendingCourses = this.pendingCourses.filter((c) => c.id !== courseId);
    this.applySearch();
    this.closeReviewModal();
    this.cdr.detectChanges();
  }

  downloadSupport(fileUrl?: string, title?: string): void {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = `Support_${title || 'cours'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
