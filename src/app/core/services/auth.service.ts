import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'eshop_jwt';
  private userKey = 'eshop_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get isAdmin(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const roleType = user.role?.type?.toLowerCase();
    const roleName = user.role?.name?.toLowerCase();
    const username = user.username?.toLowerCase();
    return (
      roleType === 'admin' ||
      roleName === 'admin' ||
      roleType === 'administrator' ||
      username === 'admin' ||
      user.email?.includes('admin@')
    );
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveAuth(jwt: string, user: User, remember = true): void {
    const storage = remember ? localStorage : sessionStorage;
    try {
      storage.setItem(this.tokenKey, jwt);
      storage.setItem(this.userKey, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  login(identifier: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/local`, {
        identifier: identifier.trim(),
        password,
      })
      .pipe(
        tap((res) => {
          this.saveAuth(res.jwt, res.user);
          // fetch full profile with roles
          this.refreshProfile().subscribe();
        })
      );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/local/register`, {
        username: username.trim(),
        email: email.trim(),
        password,
      })
      .pipe(
        tap((res) => {
          this.saveAuth(res.jwt, res.user);
          this.refreshProfile().subscribe();
        })
      );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    } catch {}
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, {
      email: email.trim(),
    });
  }

  resetPassword(code: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      code,
      password,
      passwordConfirmation,
    });
  }

  refreshProfile(): Observable<User | null> {
    if (!this.getToken()) return of(null);
    return this.http.get<User>(`${environment.apiUrl}/profile`).pipe(
      catchError(() => this.http.get<User>(`${environment.apiUrl}/users/me`)),
      tap((user) => {
        if (user) {
          const current = this.currentUserSubject.getValue() || {};
          const merged = { ...current, ...user };
          this.currentUserSubject.next(merged as User);
          try {
            localStorage.setItem(this.userKey, JSON.stringify(merged));
          } catch {}
        }
      }),
      catchError(() => of(null))
    );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile`, profileData).pipe(
      tap((updated) => {
        const current = this.currentUserSubject.getValue() || {};
        const merged = { ...current, ...updated };
        this.currentUserSubject.next(merged as User);
        try {
          localStorage.setItem(this.userKey, JSON.stringify(merged));
        } catch {}
      })
    );
  }
}
