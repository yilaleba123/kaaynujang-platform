import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  currentLang = 'fr';
  mobileMenuOpen = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.addLangs(['fr', 'en']);

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang');
      if (savedLang) {
        this.currentLang = savedLang;
        this.translate.use(savedLang);
      } else {
        this.translate.use('fr');
      }
    } else {
      this.translate.use('fr');
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  scrollToSection(sectionId: string) {
    this.closeMobileMenu();
    if (isPlatformBrowser(this.platformId)) {
      if (this.router.url !== '/' && !this.router.url.startsWith('/#')) {
        this.router.navigate(['/']).then(() => {
          setTimeout(() => this.execScroll(sectionId), 100);
        });
      } else {
        this.execScroll(sectionId);
      }
    }
  }

  private execScroll(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
