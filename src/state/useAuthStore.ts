// src/state/useAuthStore.ts
import { create } from 'zustand';
import { authService } from '@/lib/auth';
import { getOrCreateDeviceId } from '@/lib/deviceId';
import type { User, Session, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';
import { useQuizLibraryStore } from './useQuizLibraryStore';
import { clearUserSpecificQueries } from '@/lib/queryClient';

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: (clearCredentials?: boolean) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
  getDeviceId: () => string;
}

// Helper function to clear all user-specific data
const clearUserSpecificData = () => {
  // Clear quiz library store
  useQuizLibraryStore.getState().resetAllState();

  // Clear React Query caches
  clearUserSpecificQueries();

  // Clear any other user-specific stores here
};

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  // State
  user: null,
  session: null,
  loading: false,

  // Actions
  login: async (data: LoginRequest) => {
    try {
      set({ loading: true });

      // Clear any existing user data before logging in
      clearUserSpecificData();

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

      // Clear any existing user data before registering
      clearUserSpecificData();

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

      // Clear all user-specific data
      clearUserSpecificData();

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      // Even if server logout fails, clear local state
      console.warn('Logout failed, but clearing local state:', error);
      authService.clearAuthData();

      // Clear all user-specific data
      clearUserSpecificData();

      set({
        user: null,
        session: null,
        loading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    const currentUser = useAuthStore.getState().user;

    // If user is changing (not just setting to null), clear user-specific data
    if (currentUser && user && currentUser.id !== user.id) {
      clearUserSpecificData();
    }

    set({ user });
  },
  setSession: (session: Session | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),

  clearAuth: () => {
    // Clear all user-specific data
    clearUserSpecificData();

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

  // Get or create device ID
  // This ensures device ID is always available for WebSocket connections and game sessions
  getDeviceId: () => {
    // Only get device ID on client side
    if (typeof window === 'undefined') {
      return '';
    }
    try {
      return getOrCreateDeviceId();
    } catch (error) {
      console.error('[useAuthStore] Failed to get device ID:', error);
      return '';
    }
  },
}));
