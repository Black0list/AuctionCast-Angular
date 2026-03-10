import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { LoginRequest, RegisterRequest, UserMe } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import { UpdateProfileRequest } from '../models/profile.models';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly api: AuthApiService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) { }

  login(body: LoginRequest): Observable<void> {
    return this.api.login(body).pipe(
      map((res) => res.data),
      tap((data) => {
        this.tokenStorage.setAccessToken(data.accessToken);
        this.tokenStorage.setRefreshToken(data.refreshToken);
      }),
      map(() => void 0)
    );
  }

  refreshToken(): Observable<void> {
    const refresh = this.tokenStorage.getRefreshToken();
    if (!refresh) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.api.refreshToken(refresh).pipe(
      map((res) => res.data),
      tap((data) => {
        this.tokenStorage.setAccessToken(data.accessToken);
        this.tokenStorage.setRefreshToken(data.refreshToken);
      }),
      map(() => void 0)
    );
  }

  register(body: RegisterRequest): Observable<void> {
    return this.api.register(body).pipe(map(() => void 0));
  }

  me(): Observable<UserMe> {
    return this.api.me().pipe(map((res) => res.data));
  }

  updateMe(req: UpdateProfileRequest): Observable<UserMe> {
    return this.api.updateMe(req).pipe(map((res) => res.data));
  }

  applySeller(): Observable<void> {
    return this.api.applySeller().pipe(map(() => void 0));
  }

  logout(): void {
    this.tokenStorage.clear();
    this.toast.info('You have been logged out');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }
}
