import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api/api-service';
import { Course, CourseStatus, STATUS_CLASS, STATUS_LABEL } from '../../api/models';
import { Icon, IconName } from '../../shared/icon';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, NgClass, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly api = inject(ApiService);

  readonly me = toSignal(this.api.getMe(), { initialValue: null });
  readonly stats = toSignal(this.api.getDashboardStats(), { initialValue: null });
  readonly courses = signal<Course[] | null>(null);
  readonly pending = toSignal(this.api.getPendingAssessments(3), { initialValue: null });

  readonly search = signal('');
  readonly statusFilter = signal<CourseStatus | null>(null);
  readonly filterOpen = signal(false);
  readonly statuses: CourseStatus[] = ['published', 'draft', 'archived'];

  readonly statusLabel = STATUS_LABEL;
  readonly statusClass = STATUS_CLASS;

  readonly filtered = computed<Course[] | null>(() => {
    const list = this.courses();
    if (!list) return null;
    const q = this.search().trim().toLowerCase();
    const s = this.statusFilter();
    return list.filter(c => (!s || c.status === s) && (!q || c.title.toLowerCase().includes(q)));
  });

  readonly cards = computed<{ label: string; value: number | string; icon: IconName; tone: string }[]>(() => {
    const s = this.stats();
    return [
      { label: 'Cours publiés', value: s?.publishedCourses ?? '–', icon: 'book', tone: 'bg-blue-50 text-blue-600' },
      { label: 'En brouillon', value: s?.draftCourses ?? '–', icon: 'edit', tone: 'bg-orange-50 text-orange-500' },
      { label: 'Apprenants inscrits', value: s?.enrolledLearners ?? '–', icon: 'users', tone: 'bg-purple-50 text-purple-600' },
      { label: 'Évaluations à corriger', value: s?.pendingSubmissions ?? '–', icon: 'check', tone: 'bg-red-50 text-red-500' },
    ];
  });

  constructor() {
    this.api.getCourses({ limit: 5 }).subscribe(c => this.courses.set(c));
  }

  archive(c: Course) {
    if (!confirm(`Archiver « ${c.title} » ?`)) return;
    this.api.archiveCourse(c.id).subscribe(u =>
      this.courses.update(l => l?.map(x => (x.id === u.id ? u : x)) ?? null));
  }

  onSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  setStatus(s: CourseStatus | null) {
    this.statusFilter.set(s);
    this.filterOpen.set(false);
  }
}