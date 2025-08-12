import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, LoginPayload, UpdateUserPayload } from '../types';

interface AuthStore extends AuthState {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loginSuccess: (payload: LoginPayload) => void;
  updateUser: (payload: UpdateUserPayload) => void;
  updateTokens: (tokens: { token: string; refreshToken: string }) => void;
  logout: () => void;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginAt: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      ...initialState,

      setLoading: (loading: boolean) =>
        set(state => ({
          isLoading: loading,
          error: loading ? null : state.error,
        })),

      setError: (error: string | null) =>
        set({
          error,
          isLoading: false,
        }),

      loginSuccess: (payload: LoginPayload) =>
        set({
          user: payload.user,
          token: payload.token,
          refreshToken: payload.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastLoginAt: new Date().toISOString(),
        }),

      updateUser: (payload: UpdateUserPayload) =>
        set(state => ({
          user: state.user ? { ...state.user, ...payload } : null,
        })),

      updateTokens: (tokens: { token: string; refreshToken: string }) =>
        set({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        }),

      logout: () => {
        // Clear the persisted state as well
        set({
          ...initialState,
        });
      },

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastLoginAt: state.lastLoginAt,
      }),
    }
  )
);
