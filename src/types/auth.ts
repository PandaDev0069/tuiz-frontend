// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
  displayName?: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface AuthError {
  error: string;
  message: string;
  code?: string;
}
