import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiService } from '../../api/api-service';
import { TeacherStats } from '../../api/models';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Statistiques {
  private readonly api = inject(ApiService);
  readonly stats = signal<TeacherStats | null>(null);
  readonly error = signal(false);

  constructor() {
    this.load();
  }

  load() {
    this.error.set(false);
    this.stats.set(null);
    this.api.getStats().subscribe({
      next: stats => this.stats.set(stats),
      error: () => this.error.set(true),
    });
  }
}