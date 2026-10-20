import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { DocumentItem } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-documents',
  imports: [DatePipe, Icon],
  templateUrl: './documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Documents {
  private readonly api = inject(ApiService);
  readonly docs = signal<DocumentItem[] | null>(null);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.api.getDocuments().subscribe({ next: d => this.docs.set(d), error: () => this.error.set('Impossible de charger les documents.') });
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    this.api.uploadDocument(file).subscribe({
      next: d => { this.docs.update(l => [d, ...(l ?? [])]); this.uploading.set(false); input.value = ''; },
      error: () => { this.uploading.set(false); this.error.set("L'envoi du fichier a échoué."); },
    });
  }

  remove(d: DocumentItem) {
    if (!confirm(`Supprimer « ${d.name} » ?`)) return;
    this.api.deleteDocument(d.id).subscribe(() => this.docs.update(l => l?.filter(x => x.id !== d.id) ?? null));
  }

  size(bytes: number) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
  }
}