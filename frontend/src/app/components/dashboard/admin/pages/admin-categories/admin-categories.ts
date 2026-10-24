import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, CourseCategory } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
})
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  categories: CourseCategory[] = [];
  filteredCategories: CourseCategory[] = [];
  isLoading = true;
  searchQuery = '';

  // Gestion de la modale d'ajout/édition
  showModal = false;
  isEditMode = false;
  selectedCategoryId: number | null = null;
  formData: Partial<CourseCategory> = {
    nom: '',
    description: '',
  };

  private MOCK_CATEGORIES: CourseCategory[] = [
    {
      id: 1,
      nom: 'Informatique & Développement Web',
      description: 'Programmation web, algorithmique, génie logiciel et technologies cloud.',
      slug: 'informatique-developpement-web',
      nombre_cours: 14,
      created_at: '2026-08-10',
    },
    {
      id: 2,
      nom: 'Sciences Exactes',
      description: 'Disciplines fondamentales : Mathématiques, Physique, Chimie et SVT.',
      slug: 'sciences-exactes',
      nombre_cours: 9,
      created_at: '2026-08-15',
    },
    {
      id: 3,
      nom: 'Gestion & Finance',
      description: 'Comptabilité générale, analyse financière et entrepreneuriat.',
      slug: 'gestion-finance',
      nombre_cours: 6,
      created_at: '2026-09-01',
    },
    {
      id: 4,
      nom: 'Marketing & Communication',
      description: 'Marketing digital, stratégies d acquisition et gestion de marques.',
      slug: 'marketing-communication',
      nombre_cours: 5,
      created_at: '2026-09-20',
    },
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = data && data.length > 0 ? data : this.MOCK_CATEGORIES;
        this.applySearch();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = this.MOCK_CATEGORIES;
        this.applySearch();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applySearch(): void {
    this.filteredCategories = this.categories.filter((cat) => {
      const searchTarget = `${cat.nom} ${cat.description || ''}`.toLowerCase();
      return searchTarget.includes(this.searchQuery.toLowerCase());
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.formData = { nom: '', description: '' };
    this.showModal = true;
  }

  openEditModal(category: CourseCategory): void {
    this.isEditMode = true;
    this.selectedCategoryId = category.id;
    this.formData = {
      nom: category.nom,
      description: category.description || '',
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { nom: '', description: '' };
    this.selectedCategoryId = null;
  }

  saveCategory(): void {
    if (!this.formData.nom?.trim()) {
      alert('Veuillez saisir un nom pour la catégorie.');
      return;
    }

    if (this.isEditMode && this.selectedCategoryId) {
      this.adminService.updateCategory(this.selectedCategoryId, this.formData).subscribe({
        next: (updated) => {
          const index = this.categories.findIndex((c) => c.id === this.selectedCategoryId);
          if (index !== -1) {
            this.categories[index] = {
              ...this.categories[index],
              ...updated,
              nom: this.formData.nom!,
            };
          }
          this.applySearch();
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => {
          // Fallback démo
          const index = this.categories.findIndex((c) => c.id === this.selectedCategoryId);
          if (index !== -1) {
            this.categories[index] = {
              ...this.categories[index],
              nom: this.formData.nom!,
              description: this.formData.description,
            };
          }
          this.applySearch();
          this.closeModal();
          this.cdr.detectChanges();
        },
      });
    } else {
      this.adminService.createCategory(this.formData).subscribe({
        next: (created) => {
          this.categories.unshift(created);
          this.applySearch();
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => {
          // Fallback démo
          const newCat: CourseCategory = {
            id: Date.now(),
            nom: this.formData.nom!,
            description: this.formData.description,
            nombre_cours: 0,
            created_at: new Date().toISOString().split('T')[0],
          };
          this.categories.unshift(newCat);
          this.applySearch();
          this.closeModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  deleteCategory(category: CourseCategory): void {
    if (confirm(`Voulez-vous vraiment supprimer la catégorie "${category.nom}" ?`)) {
      this.adminService.deleteCategory(category.id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== category.id);
          this.applySearch();
          this.cdr.detectChanges();
        },
        error: () => {
          this.categories = this.categories.filter((c) => c.id !== category.id);
          this.applySearch();
          this.cdr.detectChanges();
        },
      });
    }
  }

  get totalCoursesAssociated(): number {
    return this.categories.reduce((acc, cat) => acc + (cat.nombre_cours || 0), 0);
  }
}
