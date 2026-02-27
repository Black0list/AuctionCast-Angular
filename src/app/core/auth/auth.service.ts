import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import {LoginRequest, RegisterRequest, UserMe} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import {UpdateProfileRequest} from '../models/profile.models';
import {Router} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly api: AuthApiService,
    private readonly tokenStorage: TokenStorageService,
    private router : Router
  ) {}

  login(body: LoginRequest): Observable<void> {
    return this.api.login(body).pipe(
      map((res) => res.data),
      tap((data) => this.tokenStorage.setAccessToken(data.accessToken)),
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

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }
}
