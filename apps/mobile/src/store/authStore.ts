import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User, LoginInput, SignupInput } from '@fitcheck/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.signup(data);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  hydrate: async () => {
    try {
      const token = await authService.getStoredToken();
      if (token) {
        const user = await authService.getProfile(token);
        set({ user, token, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      // Token invalid or expired — clear session
      await authService.logout();
      set({ isHydrated: true });
    }
  },

  updateUser: (updates) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

  clearError: () => set({ error: null }),
}));
