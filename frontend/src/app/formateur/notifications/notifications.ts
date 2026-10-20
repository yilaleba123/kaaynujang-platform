import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../../api/models';
import { NotificationService } from '../../shared/notification-service';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
  private readonly router = inject(Router);
  readonly notifs = inject(NotificationService);

  open(n: AppNotification) {
    if (!n.read) this.notifs.markRead(n.id);
    if (n.link) this.router.navigateByUrl(n.link);
  }
}