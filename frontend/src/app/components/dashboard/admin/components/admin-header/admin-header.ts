import {
  Component,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, User } from '../../../../../services/auth';
import { NotificationService } from '../../../../../services/notification.service';
import { AdminNotification } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  @Output() toggleHamburger = new EventEmitter<void>();

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);

  currentUser: User | null = this.authService.getCurrentUser();
  currentPageTitle = 'Accueil';
  avatarOpen = false;
  notifOpen = false;

  notifications: AdminNotification[] = [];
  notifCount = 0;

  private routerSub!: Subscription;
  private notifSub!: Subscription;
  private unreadSub!: Subscription;

  private routeTitles: Record<string, string> = {
    '/dashboard/admin': 'Accueil',
    '/dashboard/admin/teachers': 'Gestion des enseignants',
    '/dashboard/admin/students': 'Gestion des apprenants',
    '/dashboard/admin/courses': 'Gestion des cours',
    '/dashboard/admin/course-validation': 'Validation des cours',
    '/dashboard/admin/categories': 'Catégories',
    '/dashboard/admin/forum': 'Forum & Modération',
    '/dashboard/admin/stats': 'Statistiques',
    '/dashboard/admin/logs': "Journal d'activité",
    '/dashboard/admin/notifications': 'Notifications',
    '/dashboard/admin/profile': 'Mon profil',
  };

  ngOnInit(): void {
    this.updateTitle(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateTitle(e.urlAfterRedirects || e.url);
        this.cdr.detectChanges();
      });

    // Abonnements réactifs aux notifications
    this.notifSub = this.notificationService.notifications$.subscribe((data) => {
      this.notifications = data;
      this.cdr.detectChanges();
    });

    this.unreadSub = this.notificationService.unreadCount$.subscribe((count) => {
      this.notifCount = count;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.unreadSub) this.unreadSub.unsubscribe();
  }

  private updateTitle(url: string): void {
    if (!url) return;

    let cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.length > 1 && cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    if (this.routeTitles[cleanUrl]) {
      this.currentPageTitle = this.routeTitles[cleanUrl];
      return;
    }

    const matchedKey = Object.keys(this.routeTitles).find(
      (key) => key !== '/dashboard/admin' && cleanUrl.startsWith(key),
    );

    this.currentPageTitle = matchedKey ? this.routeTitles[matchedKey] : 'Accueil';
  }

  toggleAvatar(): void {
    this.avatarOpen = !this.avatarOpen;
    if (this.avatarOpen) this.notifOpen = false;
  }

  toggleNotif(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) this.avatarOpen = false;
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(item: AdminNotification): void {
    this.notificationService.markAsRead(item.id);
    this.notifOpen = false;
    if (item.lien) {
      this.router.navigateByUrl(item.lien);
    }
  }

  goToAllNotifications(): void {
    this.notifOpen = false;
    this.router.navigate(['/dashboard/admin/notifications']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Ferme automatiquement les menus déroulants si on clique n'importe où ailleurs sur la page
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.avatarOpen = false;
      this.notifOpen = false;
    }
  }
}
