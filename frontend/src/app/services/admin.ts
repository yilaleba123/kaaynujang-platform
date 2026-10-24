import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface UserProfile {
  specialite?: string;
  centre_formation?: string;
  diplome?: string;
  cv?: string;
  photo?: string;
  telephone?: string;
  adresse?: string;
  niveau_etude?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'APPRENANT';
  est_valide: boolean;
  profile?: UserProfile;
  date_joined?: string;
}

export interface AdminStats {
  total_users: number;
  pending_users: number;
  total_courses: number;
  pending_courses: number;
  total_enrollments: number;
  taux_completion?: number;
  apprenants_actifs?: number;
}

export interface AuditLogItem {
  id: number;
  user: string;
  action: string;
  ip_address: string;
  created_at: string;
  details?: string;
  type_action?: 'CONNEXION' | 'MODERATION' | 'GESTION_USER' | 'SYSTEME';
}

export interface AdminCourse {
  id: number;
  titre: string;
  description?: string;
  enseignant_name: string;
  categorie: string;
  niveau?: string;
  prix?: number; // Rendu optionnel pour la gratuité du site
  statut: 'PUBLIE' | 'EN_ATTENTE' | 'BROUILLON' | 'REJETE';
  nombre_eleves?: number; // Optionnel
  note_moyenne?: number; // Optionnel
  created_at?: string;
  support_cours?: string; // Fichier joint au cours
}

export interface CourseCategory {
  id: number;
  nom: string;
  description?: string;
  slug?: string;
  nombre_cours?: number;
  created_at?: string;
}

export interface ForumReport {
  id: number;
  titre_sujet: string;
  auteur: string;
  signale_par: string;
  raison: string;
  contenu: string;
  statut: 'EN_ATTENTE' | 'RESOLU' | 'SUPPRIME';
  created_at?: string;
}
export interface AdminNotification {
  id: number;
  titre: string;
  message: string;
  type: 'USER' | 'COURSE' | 'FORUM' | 'SYSTEM';
  est_lue: boolean;
  created_at: string;
  lien?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/auth/admin/users';
  private coursesApiUrl = 'http://127.0.0.1:8000/api/courses';

  // 1. Récupération des utilisateurs avec filtres
  getUsers(role?: string, estValide?: boolean): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (estValide !== undefined) params = params.set('est_valide', estValide.toString());

    return this.http.get<AdminUser[]>(`${this.apiUrl}/`, { params }).pipe(catchError(() => of([])));
  }

  // 2. Actions Admin : Utilisateurs
  validateUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/validate/`, {});
  }

  rejectUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/reject/`, {});
  }

  invalidateUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/invalidate/`, {});
  }

  // 3. Modération & Gestion des cours
  getCourses(statut?: string): Observable<AdminCourse[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);

    return this.http
      .get<AdminCourse[]>(`${this.coursesApiUrl}/courses/`, { params })
      .pipe(catchError(() => of([])));
  }

  validateCourse(courseId: number): Observable<any> {
    return this.http.patch(`${this.coursesApiUrl}/courses/${courseId}/`, { statut: 'PUBLIE' });
  }

  updateCourseStatus(
    courseId: number,
    statut: 'PUBLIE' | 'EN_ATTENTE' | 'BROUILLON' | 'REJETE',
  ): Observable<any> {
    return this.http.patch(`${this.coursesApiUrl}/courses/${courseId}/`, { statut });
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.coursesApiUrl}/courses/${courseId}/`);
  }

  // 4. Statistiques du tableau de bord
  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('http://127.0.0.1:8000/api/auth/admin/stats/').pipe(
      catchError(() =>
        of({
          total_users: 0,
          pending_users: 0,
          total_courses: 0,
          pending_courses: 0,
          total_enrollments: 0,
        }),
      ),
    );
  }
  // 5. Historique d'activités
  getAuditLogs(): Observable<AuditLogItem[]> {
    return this.http
      .get<AuditLogItem[]>('http://127.0.0.1:8000/api/auth/admin/audit-logs/')
      .pipe(catchError(() => of([])));
  }

  getCategories(): Observable<CourseCategory[]> {
    return this.http
      .get<CourseCategory[]>(`${this.coursesApiUrl}/categories/`)
      .pipe(catchError(() => of([])));
  }

  createCategory(categoryData: Partial<CourseCategory>): Observable<CourseCategory> {
    return this.http.post<CourseCategory>(`${this.coursesApiUrl}/categories/`, categoryData);
  }

  updateCategory(id: number, categoryData: Partial<CourseCategory>): Observable<CourseCategory> {
    return this.http.patch<CourseCategory>(`${this.coursesApiUrl}/categories/${id}/`, categoryData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.coursesApiUrl}/categories/${id}/`);
  }

  getForumReports(statut?: string): Observable<ForumReport[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);

    return this.http
      .get<ForumReport[]>(`${this.coursesApiUrl}/forum/reports/`, { params })
      .pipe(catchError(() => of([])));
  }

  resolveForumReport(id: number): Observable<any> {
    return this.http.patch(`${this.coursesApiUrl}/forum/reports/${id}/`, { statut: 'RESOLU' });
  }

  deleteForumContent(id: number): Observable<any> {
    return this.http.delete(`${this.coursesApiUrl}/forum/reports/${id}/`);
  }
  getNotifications(): Observable<AdminNotification[]> {
    return this.http
      .get<AdminNotification[]>(`${this.apiUrl}/notifications/`)
      .pipe(catchError(() => of([])));
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/`, { est_lue: true });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-all-read/`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${id}/`);
  }
}
