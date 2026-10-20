import { Component, signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

// Structure commune aux pages apprenant
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',

  // Fermeture du menu avec Échap
  host: {
    '(document:keydown.escape)': 'menuOuvert.set(false)',
  },
})
export class Layout {
  // État du menu latéral
  protected readonly menuOuvert = signal(false);
}
