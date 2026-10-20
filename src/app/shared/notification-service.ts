import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '../api/api-service';
import { AppNotification } from '../api/models';

/** État partagé : la cloche du header et la page « Notifications » lisent les mêmes données. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  readonly items = signal<AppNotification[]>([]);
  readonly loaded = signal(false);
  readonly unread = computed(() => this.items().filter(n => !n.read).length);
  readonly recent = computed(() => this.items().slice(0, 5));

  load() {
    this.api.getNotifications().subscribe({
      next: l => { this.items.set(l); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }

  markRead(id: string) {
    this.items.update(l => l.map(n => (n.id === id ? { ...n, read: true } : n)));
    this.api.markNotificationRead(id).subscribe({ error: () => this.load() });
  }

  markAllRead() {
    this.items.update(l => l.map(n => ({ ...n, read: true })));
    this.api.markAllNotificationsRead().subscribe({ error: () => this.load() });
  }
}