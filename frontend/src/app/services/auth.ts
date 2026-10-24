import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'APPRENANT';
  est_valide: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, formData);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId) && response.access) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          if (response.user) {
            localStorage.setItem('current_user', JSON.stringify(response.user));
          }
        }
      }),
    );
  }

  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('current_user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}
