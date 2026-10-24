import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AuditLogItem } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-logs.html',
  styleUrl: './admin-logs.scss',
})
export class AdminLogsComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  logs: AuditLogItem[] = [];
  filteredLogs: AuditLogItem[] = [];
  isLoading = true;

  searchQuery = '';
  typeFilter: 'ALL' | 'CONNEXION' | 'MODERATION' | 'GESTION_USER' | 'SYSTEME' = 'ALL';

  selectedLog: AuditLogItem | null = null;
  showDetailModal = false;

  private MOCK_LOGS: AuditLogItem[] = [
    {
      id: 1001,
      user: 'admin@kaaynujang.edu',
      action: 'Validation du cours "Développement Web Moderne avec Django & Angular"',
      ip_address: '197.214.72.10',
      created_at: '2026-10-24 14:32:10',
      type_action: 'MODERATION',
      details: 'Changement de statut du cours ID #1 (EN_ATTENTE vers PUBLIE).',
    },
    {
      id: 1002,
      user: 'kofi.mensah@kaaynujang.edu',
      action: 'Connexion réussie à l espace formateur',
      ip_address: '41.207.195.4',
      created_at: '2026-10-24 13:15:44',
      type_action: 'CONNEXION',
      details: 'Authentification JWT via terminal web (Chrome 128 / Windows).',
    },
    {
      id: 1003,
      user: 'admin@kaaynujang.edu',
      action: 'Approbation du compte enseignant "Dr. Ibrahima Konaté"',
      ip_address: '197.214.72.10',
      created_at: '2026-10-23 18:45:00',
      type_action: 'GESTION_USER',
      details: 'Validation des pièces justificatives et activation des droits de publication.',
    },
    {
      id: 1004,
      user: 'system@kaaynujang.edu',
      action: 'Mise à jour automatique du schéma de la base de données',
      ip_address: '127.0.0.1',
      created_at: '2026-10-23 04:00:12',
      type_action: 'SYSTEME',
      details: 'Exécution des scripts DDL database/schema.sql sans erreurs.',
    },
    {
      id: 1005,
      user: 'fatou.ndiaye@kaaynujang.edu',
      action: 'Signalement d un message dans le forum de discussion',
      ip_address: '154.68.22.81',
      created_at: '2026-10-22 11:20:30',
      type_action: 'MODERATION',
      details: 'Signalement émis pour le message #45 pour cause de spam.',
    },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.adminService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = data && data.length > 0 ? data : this.MOCK_LOGS;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.logs = this.MOCK_LOGS;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter((log) => {
      const searchTarget =
        `${log.user} ${log.action} ${log.ip_address} ${log.details || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(this.searchQuery.toLowerCase());

      let matchesType = true;
      if (this.typeFilter !== 'ALL') {
        matchesType = log.type_action === this.typeFilter;
      }

      return matchesSearch && matchesType;
    });
  }

  openDetailModal(log: AuditLogItem): void {
    this.selectedLog = log;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedLog = null;
  }
}
