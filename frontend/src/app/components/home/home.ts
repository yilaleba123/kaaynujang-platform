import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import des sous-composants
import { HeroComponent } from './sections/hero/hero';
import { AdvantagesComponent } from './sections/advantages/advantages';
import { FeaturedCoursesComponent } from './sections/featured-courses/featured-courses';
import { TestimonialsComponent } from './sections/testimonials/testimonials'; // <-- AJOUT
import { AboutComponent } from './sections/about/about';
import { ContactFaqComponent } from './sections/contact-faq/contact-faq';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    AdvantagesComponent,
    FeaturedCoursesComponent,
    TestimonialsComponent,
    AboutComponent,
    ContactFaqComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  activeLegalModal: 'privacy' | 'terms' | null = null;
}
