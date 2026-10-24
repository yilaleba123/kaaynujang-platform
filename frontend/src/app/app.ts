import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/home/sections/footer/footer';
import { LegalModalComponent } from './components/home/sections/legal-modal/legal-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, LegalModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  isDashboardRoute = false;

  // Typage strict compatible avec LegalModalComponent
  activeLegalModal: 'privacy' | 'terms' | null = null;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isDashboardRoute = (event.urlAfterRedirects || event.url).startsWith('/dashboard');
      });
  }

  openLegalModal(modalType: string | null): void {
    if (modalType === 'privacy' || modalType === 'terms') {
      this.activeLegalModal = modalType;
    } else {
      this.activeLegalModal = null;
    }
  }
}
