import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppNotification } from '../../api/models';
import { AuthService } from '../../auth/auth-service';
import { Icon, IconName } from '../../shared/icon';
import { NotificationService } from '../../shared/notification-service';

interface NavItem { label: string; icon: IconName; link: string; exact?: boolean; }
interface NavSection { title: string; items: NavItem[]; }

@Component({
  selector: 'app-formateur-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, Icon],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // un clic n'importe où (ou Échap) ferme les menus déroulants
  host: { '(document:click)': 'close()', '(document:keydown.escape)': 'close()' },
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly notifs = inject(NotificationService);

  readonly sidebarOpen = signal(true);
  readonly open = signal<'notif' | 'user' | null>(null);

  readonly sections: NavSection[] = [
    { title: 'Tableau de bord', items: [{ label: 'Accueil', icon: 'home', link: '/formateur', exact: true }] },
    { title: 'Mes contenus', items: [
      { label: 'Mes cours', icon: 'book', link: '/formateur/mes-cours' },
      { label: 'Créer un cours', icon: 'plus', link: '/formateur/cree-cours' },
      { label: 'Documents', icon: 'file', link: '/formateur/documents' },
    ] },
    { title: 'Évaluations', items: [
      { label: 'Mes quiz', icon: 'help', link: '/formateur/quiz' },
      { label: 'Copies à corriger', icon: 'check', link: '/formateur/copies' },
    ] },
    { title: 'Suivi', items: [
      { label: 'Mes apprenants', icon: 'users', link: '/formateur/apprenants' },
      { label: 'Statistiques', icon: 'chart', link: '/formateur/statistiques' },
    ] },
    { title: 'Échanges', items: [{ label: 'Messagerie', icon: 'message', link: '/formateur/messagerie' }] },
  ];

  constructor() { this.notifs.load(); }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  toggle(menu: 'notif' | 'user', e: Event) {
    e.stopPropagation(); // sinon le clic "document" refermerait aussitôt le menu
    this.open.update(c => (c === menu ? null : menu));
  }

  close() { this.open.set(null); }

  openNotification(n: AppNotification) {
    this.notifs.markRead(n.id);
    this.close();
    if (n.link) this.router.navigateByUrl(n.link);
  }

  logout() {
    this.close();
    this.auth.logout();
  }
}