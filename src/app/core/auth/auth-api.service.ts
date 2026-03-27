import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  refreshToken(token: string) {
    const params = new HttpParams().set('refreshToken', token);
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/user-service/auth/refresh`,
      {},
      { params }
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
    if (req.addressLine1 !== undefined) form.append('addressLine1', req.addressLine1);
    if (req.addressLine2 !== undefined) form.append('addressLine2', req.addressLine2);
    if (req.city !== undefined) form.append('city', req.city);
    if (req.state !== undefined) form.append('state', req.state);
    if (req.postalCode !== undefined) form.append('postalCode', req.postalCode);
    if (req.country !== undefined) form.append('country', req.country);
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
