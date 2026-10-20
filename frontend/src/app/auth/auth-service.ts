import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../api/models';

const KEY = 'kaaynujang_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _token = signal<string | null>(this.isBrowser ? localStorage.getItem(KEY) : null);
  readonly isLoggedIn = computed(() => !!this._token());

  token(): string | null {
    return this._token();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(r => {
        if (!r?.token) {
          throw new Error('La réponse de connexion ne contient pas de jeton.');
        }
        this._token.set(r.token);
        if (this.isBrowser) localStorage.setItem(KEY, r.token);
      }),
    );
  }

  register(data: FormData): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, data);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }

  /** Prévient le serveur (si possible), puis efface la session locale. */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => this.expire()),
    ).subscribe();
  }

  /** Efface la session et renvoie vers la page de connexion (aussi utilisé sur erreur 401). */
  expire(): void {
    this._token.set(null);
    if (this.isBrowser) localStorage.removeItem(KEY);
    this.router.navigate(['/connexion']);
  }
}