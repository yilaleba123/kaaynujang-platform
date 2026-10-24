import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { AdminNotification } from './admin';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/auth/admin/notifications';

  // État réactif partagé entre la Navbar et les pages
  private notificationsSubject = new BehaviorSubject<AdminNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadInitialNotifications();
  }

  loadInitialNotifications(): void {
    this.http
      .get<AdminNotification[]>(`${this.apiUrl}/`)
      .pipe(catchError(() => of(this.getMockNotifications())))
      .subscribe((data) => {
        this.updateState(data);
      });
  }

  private updateState(notifications: AdminNotification[]): void {
    this.notificationsSubject.next(notifications);
    const unread = notifications.filter((n) => !n.est_lue).length;
    this.unreadCountSubject.next(unread);
  }

  markAsRead(id: number): void {
    const current = this.notificationsSubject.getValue();
    const updated = current.map((n) => (n.id === id ? { ...n, est_lue: true } : n));
    this.updateState(updated);

    this.http
      .patch(`${this.apiUrl}/${id}/`, { est_lue: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.getValue();
    const updated = current.map((n) => ({ ...n, est_lue: true }));
    this.updateState(updated);

    this.http
      .post(`${this.apiUrl}/mark-all-read/`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private getMockNotifications(): AdminNotification[] {
    return [
      {
        id: 1,
        titre: 'Nouveau cours soumis pour validation',
        message:
          'Le Dr. Ibrahima Konaté a soumis le cours "Bases de données relationnelles SQL & PostgreSQL".',
        type: 'COURSE',
        est_lue: false,
        created_at: '2026-10-24 16:20',
        lien: '/dashboard/admin/course-validation',
      },
      {
        id: 2,
        titre: 'Demande d approbation Enseignant',
        message:
          'Un nouveau dossier d enseignant au nom de "Ing. Kofi Mensah" nécessite votre vérification.',
        type: 'USER',
        est_lue: false,
        created_at: '2026-10-24 11:05',
        lien: '/dashboard/admin/teachers',
      },
      {
        id: 3,
        titre: 'Signalement émis sur le forum',
        message:
          'Un message a été signalé par un apprenant dans le sujet "Problème de connexion aux serveurs".',
        type: 'FORUM',
        est_lue: false,
        created_at: '2026-10-23 09:40',
        lien: '/dashboard/admin/forum',
      },
      {
        id: 4,
        titre: 'Sauvegarde de la base de données effectuée',
        message:
          'La sauvegarde automatique du fichier schema.sql et des données a été finalisée avec succès.',
        type: 'SYSTEM',
        est_lue: true,
        created_at: '2026-10-23 04:00',
      },
    ];
  }
}
