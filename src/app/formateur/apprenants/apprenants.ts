import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../api/api-service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-apprenants',
  imports: [DatePipe, Icon],
  templateUrl: './apprenants.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apprenants {
  readonly learners = toSignal(inject(ApiService).getLearners(), { initialValue: null });
  readonly search = signal('');

  readonly filtered = computed(() => {
    const l = this.learners();
    const q = this.search().trim().toLowerCase();
    return l && l.filter(x => !q || x.fullName.toLowerCase().includes(q) || x.email.toLowerCase().includes(q) || x.courseTitle.toLowerCase().includes(q));
  });

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
}