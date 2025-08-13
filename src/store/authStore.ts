import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AuthState, LoginPayload, UpdateUserPayload } from '../types';
import { devtools, stateInspector } from '../utils/zustandDevtools';

interface AuthStore extends AuthState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loginSuccess: (payload: LoginPayload) => void;
  updateUser: (payload: UpdateUserPayload) => void;
  updateTokens: (tokens: { token: string; refreshToken: string }) => void;
  logout: () => void;
  clearError: () => void;
  isTokenExpired: () => boolean;
  hydrate: () => Promise<void>;
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
    devtools(
      (set, get) => ({
        ...initialState,

        setLoading: (loading: boolean) =>
          set(
            state => ({
              isLoading: loading,
              error: loading ? null : state.error,
            }),
            false,
            'setLoading'
          ),

        setError: (error: string | null) =>
          set(
            {
              error,
              isLoading: false,
            },
            false,
            'setError'
          ),

        loginSuccess: (payload: LoginPayload) => {
          const { user, token, refreshToken } = payload;
          set(
            {
              user,
              token,
              refreshToken,
              isAuthenticated: !!(user && token),
              isLoading: false,
              error: null,
              lastLoginAt: new Date().toISOString(),
            },
            false,
            'loginSuccess'
          );
        },

        updateUser: (payload: UpdateUserPayload) =>
          set(
            state => ({
              user: state.user ? { ...state.user, ...payload } : null,
            }),
            false,
            'updateUser'
          ),

        updateTokens: (tokens: { token: string; refreshToken: string }) =>
          set(
            {
              token: tokens.token,
              refreshToken: tokens.refreshToken,
            },
            false,
            'updateTokens'
          ),

        logout: () => {
          set(
            {
              ...initialState,
            },
            false,
            'logout'
          );
        },

        clearError: () =>
          set(
            {
              error: null,
            },
            false,
            'clearError'
          ),

        isTokenExpired: () => {
          const { token } = get();
          if (!token) {
            return true;
          }
          try {
            const decoded: { exp: number } = jwtDecode(token);
            const isExpired = Date.now() >= decoded.exp * 1000;
            if (isExpired) {
              get().logout();
            }
            return isExpired;
          } catch (e) {
            console.error('Failed to decode token:', e);
            get().logout();
            return true;
          }
        },

        hydrate: async () => {
          try {
            const state = await AsyncStorage.getItem('auth-storage');
            if (state) {
              const {
                user,
                token,
                refreshToken,
                isAuthenticated,
                lastLoginAt,
              } = JSON.parse(state).state;
              set({
                user,
                token,
                refreshToken,
                isAuthenticated,
                lastLoginAt,
              });
            }
          } catch (e) {
            console.error('Failed to hydrate auth store:', e);
          }
        },
      }),
      'AuthStore'
    ),
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
      onRehydrateStorage: () => state => {
        if (state) {
          state.isTokenExpired();
        }
      },
    }
  )
);

// Register store with state inspector
stateInspector.registerStore('AuthStore', useAuthStore);

// Initial hydration
useAuthStore.getState().hydrate();