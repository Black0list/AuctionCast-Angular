import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
