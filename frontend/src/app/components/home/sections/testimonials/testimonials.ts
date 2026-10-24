import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class TestimonialsComponent {
  /**
   * Témoignages d'apprenants ayant bénéficié des cours sur KAAYNUJÀNG.
   * Conforme à la charte : Sans émojis, visuel épuré et professionnel.
   */
  testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'Développeuse Frontend',
      quote:
        "KAAYNUJÀNG m'a permis d'acquérir les compétences nécessaires pour décrocher mon premier emploi dans la tech.",
    },
    {
      name: 'Moussa Sow',
      role: 'Entrepreneur',
      quote:
        "Les cours en marketing digital sont extrêmement pratiques. J'ai pu appliquer les stratégies directement à ma startup.",
    },
    {
      name: 'Fatou Ndiaye',
      role: 'Data Analyst',
      quote:
        "La flexibilité de la plateforme est incroyable. J'ai pu suivre la formation le soir tout en gardant mon emploi de jour.",
    },
  ];
}
