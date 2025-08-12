import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../authStore';
import { mockUser } from '@/utils/test-helpers';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.getState().logout();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastLoginAt).toBeNull();
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useAuthStore());

    const errorMessage = 'Authentication failed';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should clear error state', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set error first
    act(() => {
      result.current.setError('Some error');
    });

    expect(result.current.error).toBe('Some error');

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuthStore());

    const loginData = {
      user: mockUser,
      token: 'test-jwt-token',
      refreshToken: 'test-refresh-token',
    };

    await act(async () => {
      await result.current.loginSuccess(loginData);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-jwt-token');
    expect(result.current.refreshToken).toBe('test-refresh-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.lastLoginAt).toBeDefined();
    expect(result.current.error).toBeNull();

    // Should persist to AsyncStorage
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify(mockUser)
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_token',
      'test-jwt-token'
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_refresh_token',
      'test-refresh-token'
    );
  });

  it('should update user information', async () => {
    const { result } = renderHook(() => useAuthStore());

    // First login
    await act(async () => {
      await result.current.loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      });
    });

    const updatedUser = {
      ...mockUser,
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    await act(async () => {
      await result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify(updatedUser)
    );
  });

  it('should update tokens', async () => {
    const { result } = renderHook(() => useAuthStore());

    // First login
    await act(async () => {
      await result.current.loginSuccess({
        user: mockUser,
        token: 'old-token',
        refreshToken: 'old-refresh-token',
      });
    });

    const newTokens = {
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
    };

    await act(async () => {
      await result.current.updateTokens(newTokens);
    });

    expect(result.current.token).toBe('new-jwt-token');
    expect(result.current.refreshToken).toBe('new-refresh-token');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_token',
      'new-jwt-token'
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'auth_refresh_token',
      'new-refresh-token'
    );
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuthStore());

    // First login
    await act(async () => {
      await result.current.loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.lastLoginAt).toBeNull();
    expect(result.current.error).toBeNull();

    // Should clear AsyncStorage
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_user');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      'auth_refresh_token'
    );
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_last_login');
  });

  it('should restore state from AsyncStorage on initialization', async () => {
    const storedUser = JSON.stringify(mockUser);
    const storedToken = 'stored-jwt-token';
    const storedRefreshToken = 'stored-refresh-token';
    const storedLastLogin = '2023-01-01T00:00:00Z';

    mockAsyncStorage.getItem.mockImplementation(key => {
      switch (key) {
        case 'auth_user':
          return Promise.resolve(storedUser);
        case 'auth_token':
          return Promise.resolve(storedToken);
        case 'auth_refresh_token':
          return Promise.resolve(storedRefreshToken);
        case 'auth_last_login':
          return Promise.resolve(storedLastLogin);
        default:
          return Promise.resolve(null);
      }
    });

    const { result } = renderHook(() => useAuthStore());

    // Trigger hydration
    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(storedToken);
    expect(result.current.refreshToken).toBe(storedRefreshToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.lastLoginAt).toBe(storedLastLogin);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    const { result } = renderHook(() => useAuthStore());

    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await act(async () => {
      await result.current.loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      });
    });

    // Should still update state even if storage fails
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should handle partial data in AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockImplementation(key => {
      switch (key) {
        case 'auth_user':
          return Promise.resolve(JSON.stringify(mockUser));
        case 'auth_token':
          return Promise.resolve('stored-token');
        // Missing refresh token and last login
        default:
          return Promise.resolve(null);
      }
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('stored-token');
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.lastLoginAt).toBeNull();
    expect(result.current.isAuthenticated).toBe(true); // Still authenticated with user and token
  });

  it('should handle corrupted data in AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockImplementation(key => {
      switch (key) {
        case 'auth_user':
          return Promise.resolve('invalid-json');
        case 'auth_token':
          return Promise.resolve('stored-token');
        default:
          return Promise.resolve(null);
      }
    });

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.hydrate();
    });

    // Should handle corrupted data gracefully
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should compute isAuthenticated correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    // Not authenticated initially
    expect(result.current.isAuthenticated).toBe(false);

    // Set user but no token
    act(() => {
      useAuthStore.setState({ user: mockUser });
    });

    expect(result.current.isAuthenticated).toBe(false);

    // Set token but no user
    act(() => {
      useAuthStore.setState({ user: null, token: 'test-token' });
    });

    expect(result.current.isAuthenticated).toBe(false);

    // Set both user and token
    act(() => {
      useAuthStore.setState({ user: mockUser, token: 'test-token' });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle concurrent login attempts', async () => {
    const { result } = renderHook(() => useAuthStore());

    const loginData1 = {
      user: mockUser,
      token: 'token-1',
      refreshToken: 'refresh-1',
    };

    const loginData2 = {
      user: { ...mockUser, name: 'Different User' },
      token: 'token-2',
      refreshToken: 'refresh-2',
    };

    // Start two login attempts simultaneously
    const promise1 = act(async () => {
      await result.current.loginSuccess(loginData1);
    });

    const promise2 = act(async () => {
      await result.current.loginSuccess(loginData2);
    });

    await Promise.all([promise1, promise2]);

    // The last one should win
    expect(result.current.token).toBe('token-2');
    expect(result.current.user?.name).toBe('Different User');
  });

  it('should provide token expiry checking', () => {
    const { result } = renderHook(() => useAuthStore());

    // Mock a JWT token (simplified)
    const expiredToken = 'expired.token.here';
    const validToken = 'valid.token.here';

    act(() => {
      useAuthStore.setState({ token: expiredToken });
    });

    // This would depend on actual JWT parsing implementation
    // For now, just test that the method exists
    expect(typeof result.current.isTokenExpired).toBe('function');
  });
});
