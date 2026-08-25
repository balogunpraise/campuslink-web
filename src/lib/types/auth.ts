export interface RegisterRequest {
  userName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionId?: string;
  studentNumber?: string;
  department?: string;
  yearOfStudy?: number;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface UserSummary {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  institutionId: string;
  institutionName: string;
  membershipStatus: string;
  isVerifiedMember: boolean;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserSummary;
}

export interface SessionResponse {
  user: UserSummary;
}
