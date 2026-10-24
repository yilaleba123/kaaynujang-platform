import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminCourse } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.scss',
})
export class AdminCoursesComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  courses: AdminCourse[] = [];
  filteredCourses: AdminCourse[] = [];
  isLoading = true;

  searchQuery = '';
  statusFilter: 'ALL' | 'PUBLISHED' | 'PENDING' | 'DRAFT' | 'REJECTED' = 'ALL';
  categoryFilter = 'ALL';
  categoriesList: string[] = [];

  selectedCourse: AdminCourse | null = null;
  showDetailModal = false;

  // Données de démonstration avec exemples de fichiers joints
  private MOCK_COURSES: AdminCourse[] = [
    {
      id: 1,
      titre: 'Développement Web Moderne avec Django & Angular',
      description:
        'Une formation complète pour concevoir des applications web modulaires, sécurisées et performantes de A à Z.',
      enseignant_name: 'Ing. Kofi Mensah',
      categorie: 'Développement Web',
      niveau: 'Intermédiaire',
      statut: 'PUBLIE',
      nombre_eleves: 124,
      note_moyenne: 4.8,
      created_at: '2026-09-15',
      support_cours: '/assets/docs/cours-django-angular.pdf',
    },
    {
      id: 2,
      titre: 'Analyse de Données Spatiales et Cartographie Web',
      description:
        'Initiation au SIG Web, manipulation de données vectorielles QGIS et intégration avec Leaflet.',
      enseignant_name: 'Dr. Ibrahima Konaté',
      categorie: 'Génie Logicielles & SIG',
      niveau: 'Avancé',
      statut: 'PUBLIE',
      nombre_eleves: 88,
      note_moyenne: 4.7,
      created_at: '2026-10-02',
      support_cours: '/assets/docs/cartographie-spatiale.pdf',
    },
    {
      id: 3,
      titre: 'Marketing Digital & Stratégies d Acquisition en Afrique de l Ouest',
      description:
        'Techniques d acquisition, gestion des réseaux sociaux et stratégies de contenu adaptées aux marchés locaux.',
      enseignant_name: 'Pr. Awa Faye',
      categorie: 'Marketing & Communication',
      niveau: 'Débutant',
      statut: 'PUBLIE',
      nombre_eleves: 45,
      note_moyenne: 4.5,
      created_at: '2026-10-12',
    },
  ];

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.adminService.getCourses().subscribe({
      next: (data) => {
        this.courses = data && data.length > 0 ? data : this.MOCK_COURSES;
        this.extractCategories();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.courses = this.MOCK_COURSES;
        this.extractCategories();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  extractCategories(): void {
    const categories = this.courses
      .map((c) => this.getCategoryName(c))
      .filter((c) => c !== 'Non spécifié');
    this.categoriesList = Array.from(new Set(categories));
  }

  getCategoryName(course: AdminCourse): string {
    if (!course.categorie) return 'Général';
    if (typeof course.categorie === 'object' && course.categorie !== null) {
      const catObj = course.categorie as { id?: number; nom?: string };
      return catObj.nom || 'Général';
    }
    return String(course.categorie);
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter((course) => {
      const categoryName = this.getCategoryName(course);
      const teacherName = course.enseignant_name || '';
      const searchTarget = `${course.titre} ${teacherName} ${categoryName}`.toLowerCase();
      const matchesSearch = searchTarget.includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.categoryFilter === 'ALL' || categoryName === this.categoryFilter;

      let matchesStatus = true;
      if (this.statusFilter === 'PUBLISHED') matchesStatus = course.statut === 'PUBLIE';
      if (this.statusFilter === 'PENDING') matchesStatus = course.statut === 'EN_ATTENTE';
      if (this.statusFilter === 'DRAFT') matchesStatus = course.statut === 'BROUILLON';
      if (this.statusFilter === 'REJECTED') matchesStatus = course.statut === 'REJETE';

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  updateStatus(
    course: AdminCourse,
    newStatus: 'PUBLIE' | 'EN_ATTENTE' | 'BROUILLON' | 'REJETE',
  ): void {
    this.adminService.updateCourseStatus(course.id, newStatus).subscribe({
      next: () => {
        course.statut = newStatus;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        course.statut = newStatus;
        this.applyFilters();
        this.cdr.detectChanges();
      },
    });
  }

  deleteCourse(course: AdminCourse): void {
    if (confirm(`Voulez-vous vraiment supprimer le cours "${course.titre}" ?`)) {
      this.adminService.deleteCourse(course.id).subscribe({
        next: () => {
          this.courses = this.courses.filter((c) => c.id !== course.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.courses = this.courses.filter((c) => c.id !== course.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeDetailModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  downloadCourseFile(fileUrl?: string, title?: string): void {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = `Support_${title || 'cours'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openDetailModal(course: AdminCourse): void {
    this.selectedCourse = course;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCourse = null;
  }

  get countPublished(): number {
    return this.courses.filter((c) => c.statut === 'PUBLIE').length;
  }
  get countPending(): number {
    return this.courses.filter((c) => c.statut === 'EN_ATTENTE').length;
  }
  get countDrafts(): number {
    return this.courses.filter((c) => c.statut === 'BROUILLON').length;
  }
}
