import {
  Component,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, User } from '../../../../../services/auth';

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
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = this.authService.getCurrentUser();
  currentPageTitle = 'Accueil';
  avatarOpen = false;
  notifCount = 3;

  private routerSub!: Subscription;

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
        this.cdr.detectChanges(); // Force le rafraîchissement réactif du DOM
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
