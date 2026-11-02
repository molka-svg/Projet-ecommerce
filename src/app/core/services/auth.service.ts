import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, switchMap, map } from 'rxjs';
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

  /**
   * Indication pour l'interface uniquement : la vraie protection est faite par Strapi
   * (permissions du rôle « Admin »). Ne jamais se baser sur l'e-mail ou le nom d'utilisateur.
   */
  get isAdmin(): boolean {
    return this.currentUser?.role?.type?.toLowerCase() === 'admin';
  }

  /** Stockage où se trouve la session actuelle (« se souvenir de moi » ou non). */
  private get activeStorage(): Storage {
    try {
      return sessionStorage.getItem(this.tokenKey) ? sessionStorage : localStorage;
    } catch {
      return localStorage;
    }
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeUser(user: User): void {
    this.currentUserSubject.next(user);
    try {
      this.activeStorage.setItem(this.userKey, JSON.stringify(user));
    } catch {}
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

  /** Enregistre la session puis charge le profil complet (avec le rôle) avant d'émettre. */
  private completeAuth(res: AuthResponse, remember: boolean): Observable<AuthResponse> {
    this.saveAuth(res.jwt, res.user, remember);
    return this.refreshProfile().pipe(map((user) => ({ ...res, user: user ?? res.user })));
  }

  login(identifier: string, password: string, remember = true): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/local`, {
        identifier: identifier.trim(),
        password,
      })
      .pipe(switchMap((res) => this.completeAuth(res, remember)));
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/local/register`, {
        username: username.trim(),
        email: email.trim(),
        password,
      })
      .pipe(switchMap((res) => this.completeAuth(res, true)));
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

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, {
      email: email.trim(),
    });
  }

  resetPassword(code: string, password: string, passwordConfirmation: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      code,
      password,
      passwordConfirmation,
    });
  }

  /** GET /api/profile (route personnalisée Strapi) : utilisateur + rôle + adresse. */
  refreshProfile(): Observable<User | null> {
    if (!this.getToken()) return of(null);
    return this.http.get<User>(`${environment.apiUrl}/profile`).pipe(
      tap((user) => {
        if (user) {
          this.storeUser({ ...(this.currentUser ?? {}), ...user } as User);
        }
      }),
      catchError(() => of(null))
    );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile`, profileData).pipe(
      tap((updated) => {
        this.storeUser({ ...(this.currentUser ?? {}), ...updated } as User);
      })
    );
  }
}
