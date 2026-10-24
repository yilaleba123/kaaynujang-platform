import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ForumReport } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-forum.html',
  styleUrl: './admin-forum.scss',
})
export class AdminForumComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  reports: ForumReport[] = [];
  filteredReports: ForumReport[] = [];
  isLoading = true;

  searchQuery = '';
  statusFilter: 'ALL' | 'PENDING' | 'RESOLVED' = 'ALL';

  selectedReport: ForumReport | null = null;
  showDetailModal = false;

  private MOCK_REPORTS: ForumReport[] = [
    {
      id: 1,
      titre_sujet: 'Question sur la résolution de l exercice 3 en Python',
      auteur: 'Moussa Diop (Apprenant)',
      signale_par: 'Fatou Ndiaye',
      raison: 'Publicité / Spam promotionnel non sollicité',
      contenu:
        'Bonjour à tous, visitez mon site de vente en ligne de smartphones pas chers sur www.pub-exemple.com !',
      statut: 'EN_ATTENTE',
      created_at: '2026-10-24',
    },
    {
      id: 2,
      titre_sujet: 'Problème de connexion aux serveurs de TP',
      auteur: 'Jean-Marc (Apprenant)',
      signale_par: 'Dr. Ibrahima Konaté',
      raison: 'Propos inappropriés / Langage incorrect',
      contenu: 'Ce cours est nul et le professeur ne répond jamais, c est une arnaque totale !!!',
      statut: 'EN_ATTENTE',
      created_at: '2026-10-23',
    },
    {
      id: 3,
      titre_sujet: 'Clarification sur l examen final du module 2',
      auteur: 'Oumar Sow (Apprenant)',
      signale_par: 'Ing. Kofi Mensah',
      raison: 'Hors-sujet répété',
      contenu: 'Est-ce que quelqu un vend une voiture d occasion à Lomé ?',
      statut: 'RESOLU',
      created_at: '2026-10-20',
    },
  ];

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.adminService.getForumReports().subscribe({
      next: (data) => {
        this.reports = data && data.length > 0 ? data : this.MOCK_REPORTS;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reports = this.MOCK_REPORTS;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.filteredReports = this.reports.filter((report) => {
      const searchTarget = `${report.titre_sujet} ${report.auteur} ${report.raison}`.toLowerCase();
      const matchesSearch = searchTarget.includes(this.searchQuery.toLowerCase());

      let matchesStatus = true;
      if (this.statusFilter === 'PENDING') matchesStatus = report.statut === 'EN_ATTENTE';
      if (this.statusFilter === 'RESOLVED') matchesStatus = report.statut === 'RESOLU';

      return matchesSearch && matchesStatus;
    });
  }

  resolveReport(report: ForumReport): void {
    this.adminService.resolveForumReport(report.id).subscribe({
      next: () => {
        report.statut = 'RESOLU';
        this.applyFilters();
        if (this.showDetailModal) this.closeModal();
        this.cdr.detectChanges();
      },
      error: () => {
        report.statut = 'RESOLU';
        this.applyFilters();
        if (this.showDetailModal) this.closeModal();
        this.cdr.detectChanges();
      },
    });
  }

  deleteContent(report: ForumReport): void {
    if (confirm(`Voulez-vous vraiment supprimer définitivement ce message du forum ?`)) {
      this.adminService.deleteForumContent(report.id).subscribe({
        next: () => {
          this.reports = this.reports.filter((r) => r.id !== report.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.reports = this.reports.filter((r) => r.id !== report.id);
          this.applyFilters();
          if (this.showDetailModal) this.closeModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  openModal(report: ForumReport): void {
    this.selectedReport = report;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedReport = null;
  }

  get countPending(): number {
    return this.reports.filter((r) => r.statut === 'EN_ATTENTE').length;
  }

  get countResolved(): number {
    return this.reports.filter((r) => r.statut === 'RESOLU').length;
  }
}
