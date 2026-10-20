import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { Learner } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-apprenants',
  imports: [DatePipe, Icon],
  templateUrl: './apprenants.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apprenants {
  private readonly api = inject(ApiService);
  readonly learners = signal<Learner[] | null>(null);
  readonly error = signal(false);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const l = this.learners();
    const q = this.search().trim().toLowerCase();
    return l && l.filter(x => !q || x.fullName.toLowerCase().includes(q) || x.email.toLowerCase().includes(q) || x.courseTitle.toLowerCase().includes(q));
  });

  constructor() {
    this.load();
  }

  load() {
    this.error.set(false);
    this.learners.set(null);
    this.api.getLearners().subscribe({
      next: learners => this.learners.set(learners),
      error: () => this.error.set(true),
    });
  }

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
}