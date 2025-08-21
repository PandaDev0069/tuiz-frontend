// src/lib/auth.ts
import { cfg } from '@/config/config';
import { credentialsService } from '@/lib/credentials';
import type { LoginRequest, RegisterRequest, AuthResponse, AuthError } from '@/types/auth';

class AuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = cfg.apiBase;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const authResponse = await response.json();

    // Store auth data with appropriate persistence based on rememberMe
    this.storeAuthData(authResponse, data.rememberMe);

    return authResponse;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;

    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const authResponse = await response.json();

    // For registration, default to not remembering (can be changed later)
    this.storeAuthData(authResponse, false);

    return authResponse;
  }

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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          // Log the error but don't throw - we still want to clear local storage
          console.warn('Server logout failed, but clearing local storage anyway');
        }
      } catch (error) {
        // Network or other errors - still clear local storage
        console.warn('Logout request failed, but clearing local storage anyway:', error);
      }
    }

    // Always clear session data
    this.clearAuthData();

    // Optionally clear saved credentials
    if (clearCredentials) {
      credentialsService.clearCredentials();
    }
  }

  // Store auth data in localStorage (always persistent for session management)
  storeAuthData(response: AuthResponse, rememberMe: boolean = false): void {
    // Session data is always stored in localStorage for persistence
    localStorage.setItem('tuiz_user', JSON.stringify(response.user));
    localStorage.setItem('tuiz_session', JSON.stringify(response.session));

    // Store the remember me preference for reference
    localStorage.setItem('tuiz_remember_me', JSON.stringify(rememberMe));
  }

  // Get stored auth data from localStorage
  getStoredAuthData(): { user: unknown; session: unknown; rememberMe?: boolean } | null {
    try {
      const userStr = localStorage.getItem('tuiz_user');
      const sessionStr = localStorage.getItem('tuiz_session');
      const rememberMeStr = localStorage.getItem('tuiz_remember_me');

      if (!userStr || !sessionStr) {
        return null;
      }

      const rememberMe = rememberMeStr ? JSON.parse(rememberMeStr) : false;

      return {
        user: JSON.parse(userStr),
        session: JSON.parse(sessionStr),
        rememberMe,
      };
    } catch {
      return null;
    }
  }

  // Clear stored auth data from localStorage
  clearAuthData(): void {
    localStorage.removeItem('tuiz_user');
    localStorage.removeItem('tuiz_session');
    localStorage.removeItem('tuiz_remember_me');
  } // Check if session is expired
  isSessionExpired(session: unknown): boolean {
    if (!session || typeof session !== 'object' || !('expires_at' in session)) {
      return true;
    }
    const typedSession = session as { expires_at: number };
    return Date.now() / 1000 > typedSession.expires_at;
  }
}

export const authService = new AuthService();
