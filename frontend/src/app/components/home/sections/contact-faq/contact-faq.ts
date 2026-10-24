import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact-faq.html',
  styleUrl: './contact-faq.scss',
})
export class ContactFaqComponent {
  // Index de la question FAQ ouverte (null si toutes sont fermées)
  activeFaq: number | null = null;

  // Liste des questions récurrentes
  faqs = [
    {
      q: 'Les cours sont-ils gratuits ?',
      a: 'Une grande partie de nos cours fondamentaux sont accessibles gratuitement après inscription. Des modules spécialisés certifiants sont également proposés.',
    },
    {
      q: "Ai-je besoin d'une connexion haut débit ?",
      a: 'Non, nos contenus pédagogiques sont optimisés pour fonctionner efficacement même sur des connexions réseau à débit limité.',
    },
    {
      q: 'Comment fonctionne le programme Force-N ?',
      a: "Le programme Force-N sélectionne les apprenants les plus assidus pour leur offrir un accompagnement et un mentorat direct vers l'insertion professionnelle.",
    },
    {
      q: 'Les certifications sont-elles reconnues ?',
      a: 'Oui, nos certificats sont délivrés en partenariat avec des universités et entreprises majeures de la région.',
    },
  ];

  /**
   * Ouvre ou ferme une question de la FAQ
   */
  toggleFaq(index: number) {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}
