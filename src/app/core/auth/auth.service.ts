import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { LoginRequest, RegisterRequest, UserMe } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import { UpdateProfileRequest } from '../models/profile.models';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<UserMe | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly api: AuthApiService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    if (this.isLoggedIn()) {
      this.me().subscribe({
        error: () => this.logout()
      });
    }
  }

  login(body: LoginRequest): Observable<void> {
    return this.api.login(body).pipe(
      map((res) => res.data),
      tap((data) => {
        this.tokenStorage.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          this.tokenStorage.setRefreshToken(data.refreshToken);
        }
      }),
      tap(() => this.me().subscribe()),
      map(() => void 0)
    );
  }

  refreshToken(): Observable<void> {
    const refresh = this.tokenStorage.getRefreshToken();
    if (!refresh) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.refreshToken(refresh).pipe(
      map((res) => res.data),
      tap((data) => {
        this.tokenStorage.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          this.tokenStorage.setRefreshToken(data.refreshToken);
        }
      }),
      map(() => void 0)
    );
  }

  register(body: RegisterRequest): Observable<void> {
    return this.api.register(body).pipe(map(() => void 0));
  }

  me(): Observable<UserMe> {
    return this.api.me().pipe(
      map((res) => res.data),
      tap((user) => this.userSubject.next(user))
    );
  }

  updateMe(req: UpdateProfileRequest): Observable<UserMe> {
    return this.api.updateMe(req).pipe(
      map((res) => res.data),
      tap((user) => this.userSubject.next(user))
    );
  }

  applySeller(): Observable<void> {
    return this.api.applySeller().pipe(map(() => void 0));
  }

  logout(): void {
    this.tokenStorage.clear();
    this.userSubject.next(null);
    this.toast.info('You have been logged out');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  getUserId(): string | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return null;
    }
  }

  getUserRoles(): string[] {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.realm_access?.roles || [];
    } catch (e) {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}
