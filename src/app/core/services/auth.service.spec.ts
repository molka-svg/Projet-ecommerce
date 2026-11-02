import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

const baseUser: User = { id: 1, username: 'admin', email: 'admin@shop.fr' };

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  const setUser = (user: User) => (auth as any).currentUserSubject.next(user);

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('is NOT admin just because of the username or e-mail', () => {
    setUser({ ...baseUser, role: { id: 1, name: 'Authenticated', type: 'authenticated' } });
    expect(auth.isAdmin).toBe(false);
  });

  it('is admin only with the Strapi "admin" role type', () => {
    setUser({ ...baseUser, role: { id: 3, name: 'Admin', type: 'admin' } });
    expect(auth.isAdmin).toBe(true);
  });

  it('login waits for the profile (with role) before emitting', () => {
    let result: User | undefined;
    auth.login('admin@shop.fr', 'secret').subscribe((res) => (result = res.user));

    http.expectOne(`${environment.apiUrl}/auth/local`).flush({ jwt: 'token', user: baseUser });
    expect(result).toBeUndefined();

    http
      .expectOne(`${environment.apiUrl}/profile`)
      .flush({ ...baseUser, role: { id: 3, name: 'Admin', type: 'admin' } });
    expect(result?.role?.type).toBe('admin');
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.isAdmin).toBe(true);
  });

  it('logout clears the session', () => {
    localStorage.setItem('eshop_jwt', 'x');
    auth.logout();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.currentUser).toBeNull();
  });
});
