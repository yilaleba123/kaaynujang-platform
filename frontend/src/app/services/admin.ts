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
}

export interface AuditLogItem {
  id: number;
  user: string;
  action: string;
  ip_address: string;
  created_at: string;
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

  // 2. Action Admin : Valider un compte utilisateur
  validateUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/validate/`, {});
  }

  rejectUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/reject/`, {});
  }
  // 3. Action Admin : Suspendre / Invalider un compte
  invalidateUser(userId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/${userId}/invalidate/`, {});
  }

  // 4. Modération des cours : Valider / Publier un cours soumis
  validateCourse(courseId: number): Observable<any> {
    return this.http.patch(`${this.coursesApiUrl}/courses/${courseId}/`, { statut: 'PUBLIE' });
  }

  // 5. Statistiques du tableau de bord (avec valeur de secours)
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

  // 6. Historique d'activités (avec tableau vide de secours)
  getAuditLogs(): Observable<AuditLogItem[]> {
    return this.http
      .get<AuditLogItem[]>('http://127.0.0.1:8000/api/auth/admin/audit-logs/')
      .pipe(catchError(() => of([])));
  }
}
