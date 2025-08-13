import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../authStore';
import { mockUser } from '@/utils/test-helpers';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockJwtDecode = jwtDecode as jest.Mock;

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState(useAuthStore.getState(), true);
    });
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

    act(() => {
      result.current.setError('Some error');
    });

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
      result.current.loginSuccess(loginData);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-jwt-token');
    expect(result.current.refreshToken).toBe('test-refresh-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.lastLoginAt).not.toBeNull();
  });

  it('should update user information', async () => {
    const { result } = renderHook(() => useAuthStore());
    const updatedUser = { ...mockUser, name: 'Updated Name' };

    await act(async () => {
      result.current.loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      });
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
  });

  it('should update tokens', async () => {
    const { result } = renderHook(() => useAuthStore());
    const newTokens = {
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
    };

    await act(async () => {
      result.current.updateTokens(newTokens);
    });

    expect(result.current.token).toBe('new-jwt-token');
    expect(result.current.refreshToken).toBe('new-refresh-token');
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      result.current.loginSuccess({
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      });
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should correctly determine if token is expired', () => {
    const { result } = renderHook(() => useAuthStore());

    // No token
    expect(result.current.isTokenExpired()).toBe(true);

    // Expired token
    mockJwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 1 });
    act(() => {
      result.current.updateTokens({
        token: 'expired-token',
        refreshToken: 'refresh-token',
      });
    });
    expect(result.current.isTokenExpired()).toBe(true);

    // Valid token
    mockJwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });
    act(() => {
      result.current.updateTokens({
        token: 'valid-token',
        refreshToken: 'refresh-token',
      });
    });
    expect(result.current.isTokenExpired()).toBe(false);
  });

  it('should rehydrate state from storage', async () => {
    const storedState = {
      state: {
        user: mockUser,
        token: 'stored-token',
        refreshToken: 'stored-refresh-token',
        isAuthenticated: true,
        lastLoginAt: new Date().toISOString(),
      },
      version: 0,
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedState));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});