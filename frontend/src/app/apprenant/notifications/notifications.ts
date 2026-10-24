import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LearnerApiService, LearnerNotification } from '../../api/learner-api-service';

@Component({
  imports: [DatePipe],
  selector: 'app-notifications',
  styleUrl: './notifications.css',
  templateUrl: './notifications.html',
})
export class Notifications {
  private readonly api = inject(LearnerApiService);
  protected readonly items = signal<LearnerNotification[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.load();
  }

  protected markRead(item: LearnerNotification): void {
    if (item.read) return;
    this.api.markNotificationRead(item.id).subscribe({
      next: () => this.items.update(items => items.map(current =>
        current.id === item.id ? { ...current, read: true } : current,
      )),
      error: () => this.error.set(true),
    });
  }

  protected markAllRead(): void {
    this.api.markAllNotificationsRead().subscribe({
      next: () => this.items.update(items => items.map(item => ({ ...item, read: true }))),
      error: () => this.error.set(true),
    });
  }

  private load(): void {
    this.api.getNotifications().subscribe({
      next: items => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
