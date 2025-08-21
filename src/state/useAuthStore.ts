// src/state/useAuthStore.ts
import { create } from 'zustand';
import { authService } from '@/lib/auth';
import type { User, Session, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: (clearCredentials?: boolean) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  // State
  user: null,
  session: null,
  loading: false,

  // Actions
  login: async (data: LoginRequest) => {
    try {
      set({ loading: true });
      const response = await authService.login(data);

      set({
        user: response.user,
        session: response.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ loading: true });
      const response = await authService.register(data);

      set({
        user: response.user,
        session: response.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async (clearCredentials: boolean = false) => {
    try {
      set({ loading: true });
      await authService.logout(clearCredentials);
      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      // Even if server logout fails, clear local state
      console.warn('Logout failed, but clearing local state:', error);
      authService.clearAuthData();
      set({
        user: null,
        session: null,
        loading: false,
      });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),

  clearAuth: () => {
    set({
      user: null,
      session: null,
      loading: false,
    });
  },

  initializeAuth: () => {
    const authData = authService.getStoredAuthData();
    if (authData && !authService.isSessionExpired(authData.session)) {
      set({
        user: authData.user as User,
        session: authData.session as Session,
      });
    } else {
      // Clear expired data
      authService.clearAuthData();
      set({
        user: null,
        session: null,
      });
    }
  },
}));
