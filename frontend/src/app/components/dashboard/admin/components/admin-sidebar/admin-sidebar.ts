import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../../../../services/auth';

interface NavItem {
  id: string;
  label: string;
  route: string;
  iconSvg: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebarComponent {
  @Input() collapsed = false;
  @Input() isMobile = false;
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = this.authService.getCurrentUser();

  navSections: NavSection[] = [
    {
      title: 'TABLEAU DE BORD',
      items: [
        {
          id: 'home',
          label: 'Accueil',
          route: '/dashboard/admin',
          iconSvg: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
        },
      ],
    },
    {
      title: 'UTILISATEURS',
      items: [
        {
          id: 'teachers',
          label: 'Gestion des enseignants',
          route: '/dashboard/admin/teachers',
          iconSvg:
            'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
        },
        {
          id: 'learners',
          label: 'Gestion des apprenants',
          route: '/dashboard/admin/students',
          iconSvg: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8',
        },
      ],
    },
    {
      title: 'CONTENUS',
      items: [
        {
          id: 'courses',
          label: 'Gestion des cours',
          route: '/dashboard/admin/courses',
          iconSvg:
            'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
        },
        {
          id: 'course-validation',
          label: 'Validation des cours',
          route: '/dashboard/admin/course-validation',
          iconSvg: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
        },
        {
          id: 'categories',
          label: 'Catégories',
          route: '/dashboard/admin/categories',
          iconSvg: 'M4 6h16M4 12h8m-8 6h16',
        },
        {
          id: 'forum',
          label: 'Forum & Modération',
          route: '/dashboard/admin/forum',
          iconSvg: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
        },
      ],
    },
    {
      title: 'SUIVI',
      items: [
        {
          id: 'stats',
          label: 'Statistiques',
          route: '/dashboard/admin/stats',
          iconSvg: 'M18 20V10 M12 20V4 M6 20v-6',
        },
        {
          id: 'journal',
          label: "Journal d'activité",
          route: '/dashboard/admin/logs',
          iconSvg:
            'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
        },
      ],
    },
    {
      title: 'SYSTÈME',
      items: [
        {
          id: 'notifs',
          label: 'Notifications',
          route: '/dashboard/admin/notifications',
          iconSvg: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
        },
        {
          id: 'profile',
          label: 'Mon profil',
          route: '/dashboard/admin/profile',
          iconSvg: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8',
        },
      ],
    },
  ];

  onNavClick(): void {
    if (this.isMobile) {
      this.closeMobile.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
