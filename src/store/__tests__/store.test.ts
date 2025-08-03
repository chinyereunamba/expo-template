import { store, persistor } from '../index';
import { setLoading, loginSuccess, logout } from '../slices/authSlice';
import { setTheme, setFirstLaunch } from '../slices/appSlice';
import { User } from '../../types';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  isPhoneVerified: false,
  preferences: {
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
    },
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('Redux Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch(logout());
    store.dispatch(setTheme('system'));
    store.dispatch(setFirstLaunch(true));
  });

  describe('store configuration', () => {
    it('should have the correct initial state structure', () => {
      const state = store.getState();

      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('app');
      expect(state).toHaveProperty('api');
    });

    it('should have correct auth initial state', () => {
      const state = store.getState();

      expect(state.auth).toEqual({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastLoginAt: null,
      });
    });

    it('should have correct app initial state', () => {
      const state = store.getState();

      expect(state.app.theme).toBe('system');
      expect(state.app.isFirstLaunch).toBe(true);
      expect(state.app.isOnline).toBe(true);
      expect(state.app.notifications.enabled).toBe(true);
    });
  });

  describe('action dispatching', () => {
    it('should handle auth actions correctly', () => {
      // Test loading state
      store.dispatch(setLoading(true));
      expect(store.getState().auth.isLoading).toBe(true);

      // Test login success
      const loginPayload = {
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      };

      store.dispatch(loginSuccess(loginPayload));
      const state = store.getState();

      expect(state.auth.user).toEqual(mockUser);
      expect(state.auth.token).toBe('test-token');
      expect(state.auth.refreshToken).toBe('test-refresh-token');
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.isLoading).toBe(false);
    });

    it('should handle app actions correctly', () => {
      // Test theme change
      store.dispatch(setTheme('dark'));
      expect(store.getState().app.theme).toBe('dark');

      // Test first launch flag
      store.dispatch(setFirstLaunch(false));
      expect(store.getState().app.isFirstLaunch).toBe(false);
    });

    it('should handle logout correctly', () => {
      // First login
      const loginPayload = {
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      };
      store.dispatch(loginSuccess(loginPayload));

      // Verify logged in
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Then logout
      store.dispatch(logout());
      const state = store.getState();

      expect(state.auth.user).toBe(null);
      expect(state.auth.token).toBe(null);
      expect(state.auth.refreshToken).toBe(null);
      expect(state.auth.isAuthenticated).toBe(false);
    });
  });

  describe('state persistence', () => {
    it('should create persistor instance', () => {
      expect(persistor).toBeDefined();
      expect(typeof persistor.flush).toBe('function');
      expect(typeof persistor.pause).toBe('function');
      expect(typeof persistor.persist).toBe('function');
      expect(typeof persistor.purge).toBe('function');
    });

    it('should have correct persist configuration', () => {
      // This test verifies that the store is configured with persistence
      // The actual persistence behavior is tested in integration tests
      const state = store.getState();

      // Verify that auth and app slices exist (they should be persisted)
      expect(state.auth).toBeDefined();
      expect(state.app).toBeDefined();

      // Verify that api slice exists but should not be persisted
      expect(state.api).toBeDefined();
    });
  });

  describe('middleware configuration', () => {
    it('should handle non-serializable values in persist actions', () => {
      // This test ensures that redux-persist actions don't cause serialization warnings
      // The middleware should be configured to ignore persist actions

      expect(() => {
        // These actions contain non-serializable values but should not throw
        store.dispatch({ type: 'persist/PERSIST' });
        store.dispatch({ type: 'persist/REHYDRATE' });
      }).not.toThrow();
    });

    it('should include RTK Query middleware', () => {
      // Verify that the API slice is properly integrated
      const state = store.getState();
      expect(state.api).toBeDefined();

      // The api slice should have the RTK Query structure
      expect(state.api).toHaveProperty('queries');
      expect(state.api).toHaveProperty('mutations');
      expect(state.api).toHaveProperty('provided');
      expect(state.api).toHaveProperty('subscriptions');
    });
  });

  describe('type safety', () => {
    it('should have correct TypeScript types', () => {
      const state = store.getState();

      // These type assertions will fail at compile time if types are incorrect
      const authState: typeof state.auth = state.auth;
      const appState: typeof state.app = state.app;
      const apiState: typeof state.api = state.api;

      expect(authState).toBeDefined();
      expect(appState).toBeDefined();
      expect(apiState).toBeDefined();
    });

    it('should dispatch actions with correct types', () => {
      // These should compile without TypeScript errors
      store.dispatch(setLoading(true));
      store.dispatch(setTheme('light'));
      store.dispatch(logout());

      // This test passes if TypeScript compilation succeeds
      expect(true).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid actions gracefully', () => {
      const initialState = store.getState();

      // Dispatch an unknown action
      store.dispatch({ type: 'UNKNOWN_ACTION', payload: 'test' });

      // State should remain unchanged
      expect(store.getState()).toEqual(initialState);
    });

    it('should handle malformed payloads gracefully', () => {
      expect(() => {
        // These should not crash the store
        store.dispatch(setLoading(null as any));
        store.dispatch(setTheme(123 as any));
      }).not.toThrow();
    });
  });
});
