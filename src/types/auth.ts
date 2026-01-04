// ====================================================
// File Name   : auth.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-08-26
//
// Description:
// - Authentication and user-related type definitions
// - Defines types for user data, sessions, and auth operations
// - Provides type safety for authentication flow
//
// Notes:
// - Types align with Supabase authentication structure
// - Session tokens follow OAuth2 token format
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Types / Interfaces
//----------------------------------------------------
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
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
