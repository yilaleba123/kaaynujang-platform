import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-modal.html',
  styleUrl: './legal-modal.scss',
})
export class LegalModalComponent {
  // Entrée : type de modale affichée ('privacy' ou 'terms' ou null)
  @Input() activeModal: 'privacy' | 'terms' | null = null;

  // Sortie : événement d'émission de fermeture
  @Output() closeModal = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }
}
