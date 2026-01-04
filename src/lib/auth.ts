// ====================================================
// File Name   : auth.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-08-22

// Description:
// - Authentication service for user login, registration, and logout
// - Manages authentication data storage in localStorage
// - Handles session management and expiration checking
// - Integrates with credentials service for credential management

// Notes:
// - Uses singleton pattern for service instance
// - Session data is always stored in localStorage for persistence
// - Logout clears local storage even if server request fails
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { cfg } from '@/config/config';
import { credentialsService } from '@/lib/credentials';
import type { LoginRequest, RegisterRequest, AuthResponse, AuthError } from '@/types/auth';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_USER = 'tuiz_user';
const STORAGE_KEY_SESSION = 'tuiz_session';
const STORAGE_KEY_REMEMBER_ME = 'tuiz_remember_me';

const HEADER_CONTENT_TYPE = 'application/json';
const AUTH_BEARER_PREFIX = 'Bearer ';

const ERROR_MESSAGE_LOGIN_FAILED = 'Login failed';
const ERROR_MESSAGE_REGISTRATION_FAILED = 'Registration failed';

const DEFAULT_REMEMBER_ME = false;
const SECONDS_TO_MILLISECONDS = 1000;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
// Types are imported from @/types/auth

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: AuthService
 * Description:
 * - Service for handling user authentication operations
 * - Manages login, registration, logout, and session storage
 * - Provides methods for checking session expiration
 */
class AuthService {
  private apiUrl: string;

  /**
   * Constructor: AuthService
   * Description:
   * - Initializes the service with API base URL from configuration
   */
  constructor() {
    this.apiUrl = cfg.apiBase;
  }

  /**
   * Method: login
   * Description:
   * - Authenticates user with email and password
   * - Stores authentication data based on rememberMe preference
   *
   * Parameters:
   * - data (LoginRequest): Login credentials and rememberMe flag
   *
   * Returns:
   * - Promise<AuthResponse>: Authentication response with user and session
   *
   * Throws:
   * - Error: When login fails or response is not OK
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': HEADER_CONTENT_TYPE,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.message || ERROR_MESSAGE_LOGIN_FAILED);
    }

    const authResponse = await response.json();
    this.storeAuthData(authResponse, data.rememberMe);

    return authResponse;
  }

  /**
   * Method: register
   * Description:
   * - Registers a new user account
   * - Stores authentication data with default rememberMe as false
   *
   * Parameters:
   * - data (RegisterRequest): Registration data including password confirmation
   *
   * Returns:
   * - Promise<AuthResponse>: Authentication response with user and session
   *
   * Throws:
   * - Error: When registration fails or response is not OK
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;

    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': HEADER_CONTENT_TYPE,
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.message || ERROR_MESSAGE_REGISTRATION_FAILED);
    }

    const authResponse = await response.json();
    this.storeAuthData(authResponse, DEFAULT_REMEMBER_ME);

    return authResponse;
  }

  /**
   * Method: logout
   * Description:
   * - Logs out user and clears authentication data
   * - Attempts server logout but clears local storage regardless of result
   * - Optionally clears saved credentials
   *
   * Parameters:
   * - clearCredentials (boolean, optional): Whether to clear saved credentials (default: false)
   *
   * Returns:
   * - Promise<void>: No return value
   */
  async logout(clearCredentials: boolean = false): Promise<void> {
    const authData = this.getStoredAuthData();
    if (
      authData &&
      typeof authData.session === 'object' &&
      authData.session !== null &&
      'access_token' in authData.session
    ) {
      const session = authData.session as { access_token: string };

      try {
        const response = await fetch(`${this.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': HEADER_CONTENT_TYPE,
            Authorization: `${AUTH_BEARER_PREFIX}${session.access_token}`,
          },
        });

        if (!response.ok) {
          console.error('Server logout failed, but clearing local storage anyway');
        }
      } catch (error) {
        console.error('Logout request failed, but clearing local storage anyway:', error);
      }
    }

    this.clearAuthData();

    if (clearCredentials) {
      credentialsService.clearCredentials();
    }
  }

  /**
   * Method: storeAuthData
   * Description:
   * - Stores authentication data in localStorage
   * - Always stores session data for persistence
   * - Stores rememberMe preference for reference
   *
   * Parameters:
   * - response (AuthResponse): Authentication response with user and session
   * - rememberMe (boolean, optional): Remember me preference (default: false)
   *
   * Returns:
   * - void: No return value
   */
  storeAuthData(response: AuthResponse, rememberMe: boolean = DEFAULT_REMEMBER_ME): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(response.session));
    localStorage.setItem(STORAGE_KEY_REMEMBER_ME, JSON.stringify(rememberMe));
  }

  /**
   * Method: getStoredAuthData
   * Description:
   * - Retrieves stored authentication data from localStorage
   * - Returns null if data is missing or invalid
   *
   * Returns:
   * - { user: unknown; session: unknown; rememberMe?: boolean } | null: Stored auth data or null
   */
  getStoredAuthData(): { user: unknown; session: unknown; rememberMe?: boolean } | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY_USER);
      const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
      const rememberMeStr = localStorage.getItem(STORAGE_KEY_REMEMBER_ME);

      if (!userStr || !sessionStr) {
        return null;
      }

      const rememberMe = rememberMeStr ? JSON.parse(rememberMeStr) : DEFAULT_REMEMBER_ME;

      return {
        user: JSON.parse(userStr),
        session: JSON.parse(sessionStr),
        rememberMe,
      };
    } catch {
      return null;
    }
  }

  /**
   * Method: clearAuthData
   * Description:
   * - Clears all stored authentication data from localStorage
   *
   * Returns:
   * - void: No return value
   */
  clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
  }

  /**
   * Method: isSessionExpired
   * Description:
   * - Checks if session has expired based on expires_at timestamp
   * - Returns true if session is invalid or missing expires_at
   *
   * Parameters:
   * - session (unknown): Session object to check
   *
   * Returns:
   * - boolean: True if session is expired or invalid, false otherwise
   */
  isSessionExpired(session: unknown): boolean {
    if (!session || typeof session !== 'object' || !('expires_at' in session)) {
      return true;
    }
    const typedSession = session as { expires_at: number };
    return Date.now() / SECONDS_TO_MILLISECONDS > typedSession.expires_at;
  }
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
// No standalone helper functions - all methods are in AuthService class

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const authService = new AuthService();
