import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api/api-service';
import { Course, CourseStatus, STATUS_CLASS, STATUS_LABEL } from '../../api/models';
import { Icon } from '../../shared/icon';

type Tab = CourseStatus | 'all';

@Component({
  selector: 'app-mes-cours',
  imports: [RouterLink, DatePipe, NgClass, Icon],
  templateUrl: './mes-cours.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesCours {
  private readonly api = inject(ApiService);

  readonly courses = signal<Course[] | null>(null);
  readonly error = signal(false);
  readonly search = signal('');
  readonly tab = signal<Tab>('all');

  readonly statusLabel = STATUS_LABEL;
  readonly statusClass = STATUS_CLASS;

  readonly counts = computed(() => {
    const l = this.courses() ?? [];
    return {
      all: l.length,
      published: l.filter(c => c.status === 'published').length,
      draft: l.filter(c => c.status === 'draft').length,
      archived: l.filter(c => c.status === 'archived').length,
    };
  });

  readonly tabs = computed<{ value: Tab; label: string; count: number }[]>(() => [
    { value: 'all', label: 'Tous', count: this.counts().all },
    { value: 'published', label: 'Publiés', count: this.counts().published },
    { value: 'draft', label: 'Brouillons', count: this.counts().draft },
    { value: 'archived', label: 'Archivés', count: this.counts().archived },
  ]);

  readonly filtered = computed(() => {
    const l = this.courses();
    if (!l) return null;
    const q = this.search().trim().toLowerCase();
    const t = this.tab();
    return l.filter(c => (t === 'all' || c.status === t) && (!q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)));
  });

  constructor() { this.load(); }

  load() {
    this.error.set(false);
    this.api.getCourses().subscribe({ next: c => this.courses.set(c), error: () => this.error.set(true) });
  }

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  archive(c: Course) {
    if (!confirm(`Archiver « ${c.title} » ?`)) return;
    this.api.archiveCourse(c.id).subscribe(u =>
      this.courses.update(l => l?.map(x => (x.id === u.id ? u : x)) ?? null));
  }
}