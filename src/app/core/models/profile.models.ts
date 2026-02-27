export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photo?: File | null;
}
