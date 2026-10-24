import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../../services/notification.service';
import { AdminNotification } from '../../../../../services/admin';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.scss',
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  notifications: AdminNotification[] = [];
  filteredNotifications: AdminNotification[] = [];
  isLoading = false;

  filterStatus: 'ALL' | 'UNREAD' | 'READ' = 'ALL';
  filterType: 'ALL' | 'USER' | 'COURSE' | 'FORUM' | 'SYSTEM' = 'ALL';

  private notifSub!: Subscription;

  ngOnInit(): void {
    this.notifSub = this.notificationService.notifications$.subscribe((data) => {
      this.notifications = data;
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

  applyFilters(): void {
    this.filteredNotifications = this.notifications.filter((item) => {
      let matchesStatus = true;
      if (this.filterStatus === 'UNREAD') matchesStatus = !item.est_lue;
      if (this.filterStatus === 'READ') matchesStatus = item.est_lue;

      let matchesType = true;
      if (this.filterType !== 'ALL') matchesType = item.type === this.filterType;

      return matchesStatus && matchesType;
    });
  }

  markAsRead(notification: AdminNotification): void {
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.est_lue).length;
  }
}
