import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  // Événement déclenché pour ouvrir la modale légale dans le composant parent
  @Output() openLegal = new EventEmitter<'privacy' | 'terms'>();

  onOpenModal(type: 'privacy' | 'terms') {
    this.openLegal.emit(type);
  }
}
