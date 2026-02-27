import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {LoginRequest, LoginResponse, RegisterRequest, UserMe} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private readonly http: HttpClient) {}

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
}
