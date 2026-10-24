import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LearnerApiService, LearnerCertificate } from '../../api/learner-api-service';

@Component({
  imports: [DatePipe],
  selector: 'app-certificats',
  styleUrl: './certificats.css',
  templateUrl: './certificats.html',
})
export class Certificats {
  private readonly api = inject(LearnerApiService);
  protected readonly certificates = signal<LearnerCertificate[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.api.getCertificates().subscribe({
      next: certificates => {
        this.certificates.set(certificates);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
