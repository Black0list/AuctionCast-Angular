export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refresh_expires_in: string;
}

export interface UserMe {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photo?: string;
  sellerStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
