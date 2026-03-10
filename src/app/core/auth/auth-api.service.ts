import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, RegisterRequest, UserMe } from '../models/auth.models';
import { UpdateProfileRequest } from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private readonly http: HttpClient) { }

  login(body: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/user-service/auth/login`,
      body
    );
  }

  register(body: RegisterRequest) {
    return this.http.post<ApiResponse<string>>(
      `${environment.apiUrl}/user-service/auth/register`,
      body
    );
  }

  me() {
    return this.http.get<ApiResponse<UserMe>>(
      `${environment.apiUrl}/user-service/auth/users/me`
    );
  }

  updateMe(req: UpdateProfileRequest) {
    const form = new FormData();

    if (req.firstName !== undefined) form.append('firstName', req.firstName);
    if (req.lastName !== undefined) form.append('lastName', req.lastName);
    if (req.phone !== undefined) form.append('phone', req.phone);
    if (req.photo) form.append('photo', req.photo);

    return this.http.patch<ApiResponse<UserMe>>(
      `${environment.apiUrl}/user-service/auth/me`,
      form
    );
  }

  applySeller() {
    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/user-service/users/apply-seller`,
      {}
    );
  }
}
