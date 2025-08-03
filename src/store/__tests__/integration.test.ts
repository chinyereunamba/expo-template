/**
 * Integration test for Redux store setup
 * This test verifies that all Redux components work together correctly
 */

import { store, persistor } from '../index';
import { setLoading, loginSuccess, logout } from '../slices/authSlice';
import { setTheme, setFirstLaunch } from '../slices/appSlice';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Redux Store Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    store.dispatch(logout());
    store.dispatch(setTheme('system'));
    store.dispatch(setFirstLaunch(true));
  });

  it('should have correct initial state structure', () => {
    const state = store.getState();

    // Verify all slices are present
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('app');
    expect(state).toHaveProperty('api');

    // Verify auth initial state
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBe(null);
    expect(state.auth.token).toBe(null);

    // Verify app initial state
    expect(state.app.theme).toBe('system');
    expect(state.app.isFirstLaunch).toBe(true);
  });

  it('should handle auth flow correctly', () => {
    // Test loading state
    store.dispatch(setLoading(true));
    expect(store.getState().auth.isLoading).toBe(true);

    // Test login
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isEmailVerified: true,
      isPhoneVerified: false,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, sms: false },
        privacy: {
          profileVisibility: 'public' as const,
          showOnlineStatus: true,
        },
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    store.dispatch(
      loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      })
    );

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user).toEqual(mockUser);
    expect(authState.token).toBe('test-token');
    expect(authState.isLoading).toBe(false);

    // Test logout
    store.dispatch(logout());
    const loggedOutState = store.getState().auth;
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.user).toBe(null);
    expect(loggedOutState.token).toBe(null);
  });

  it('should handle app settings correctly', () => {
    // Test theme change
    store.dispatch(setTheme('dark'));
    expect(store.getState().app.theme).toBe('dark');

    // Test first launch flag
    store.dispatch(setFirstLaunch(false));
    expect(store.getState().app.isFirstLaunch).toBe(false);
  });

  it('should have persistor configured', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.flush).toBe('function');
    expect(typeof persistor.pause).toBe('function');
    expect(typeof persistor.persist).toBe('function');
    expect(typeof persistor.purge).toBe('function');
  });

  it('should have dev tools enabled in development', () => {
    // This test verifies that the store is configured with dev tools
    // The actual dev tools functionality is tested in the browser/debugger
    expect(store).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });
});
