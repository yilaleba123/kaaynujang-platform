import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api/api-service';
import { Submission, SubmissionStatus } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-copies',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './copies.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Copies {
  private readonly api = inject(ApiService);
  readonly tab = signal<SubmissionStatus>('pending');
  readonly items = signal<Submission[] | null>(null);
  readonly error = signal(false);
  readonly tabs: { value: SubmissionStatus; label: string }[] = [
    { value: 'pending', label: 'À corriger' },
    { value: 'graded', label: 'Corrigées' },
  ];

  constructor() { this.load(); }

  select(t: SubmissionStatus) { this.tab.set(t); this.load(); }

  private load() {
    this.items.set(null);
    this.error.set(false);
    this.api.getSubmissions(this.tab()).subscribe({
      next: l => this.items.set(l),
      error: () => this.error.set(true),
    });
  }
}