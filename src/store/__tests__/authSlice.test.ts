import authSlice, {
  setLoading,
  setError,
  loginSuccess,
  updateUser,
  updateTokens,
  logout,
  clearError,
} from '../slices/authSlice';
import { AuthState, User } from '../../types';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  avatar: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
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

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginAt: null,
};

describe('authSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authSlice(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setLoading', () => {
      const actual = authSlice(initialState, setLoading(true));
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
    });

    it('should handle setError', () => {
      const errorMessage = 'Something went wrong';
      const actual = authSlice(initialState, setError(errorMessage));
      expect(actual.error).toBe(errorMessage);
      expect(actual.isLoading).toBe(false);
    });

    it('should handle loginSuccess', () => {
      const loginPayload = {
        user: mockUser,
        token: 'access-token',
        refreshToken: 'refresh-token',
      };

      const actual = authSlice(initialState, loginSuccess(loginPayload));

      expect(actual.user).toEqual(mockUser);
      expect(actual.token).toBe('access-token');
      expect(actual.refreshToken).toBe('refresh-token');
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(null);
      expect(actual.lastLoginAt).toBeTruthy();
    });

    it('should handle updateUser', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const updatePayload = {
        name: 'Updated Name',
        phone: '+9876543210',
      };

      const actual = authSlice(stateWithUser, updateUser(updatePayload));

      expect(actual.user).toEqual({
        ...mockUser,
        ...updatePayload,
      });
    });

    it('should not update user if user is null', () => {
      const updatePayload = {
        name: 'Updated Name',
      };

      const actual = authSlice(initialState, updateUser(updatePayload));
      expect(actual.user).toBe(null);
    });

    it('should handle updateTokens', () => {
      const stateWithAuth: AuthState = {
        ...initialState,
        user: mockUser,
        token: 'old-token',
        refreshToken: 'old-refresh-token',
        isAuthenticated: true,
      };

      const tokenPayload = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const actual = authSlice(stateWithAuth, updateTokens(tokenPayload));

      expect(actual.token).toBe('new-access-token');
      expect(actual.refreshToken).toBe('new-refresh-token');
      expect(actual.user).toEqual(mockUser);
      expect(actual.isAuthenticated).toBe(true);
    });

    it('should handle logout', () => {
      const authenticatedState: AuthState = {
        user: mockUser,
        token: 'access-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastLoginAt: '2023-01-01T00:00:00Z',
      };

      const actual = authSlice(authenticatedState, logout());

      expect(actual).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const actual = authSlice(stateWithError, clearError());
      expect(actual.error).toBe(null);
    });
  });

  describe('action creators', () => {
    it('should create setLoading action', () => {
      const expectedAction = {
        type: 'auth/setLoading',
        payload: true,
      };
      expect(setLoading(true)).toEqual(expectedAction);
    });

    it('should create setError action', () => {
      const errorMessage = 'Test error';
      const expectedAction = {
        type: 'auth/setError',
        payload: errorMessage,
      };
      expect(setError(errorMessage)).toEqual(expectedAction);
    });

    it('should create loginSuccess action', () => {
      const loginPayload = {
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh-token',
      };
      const expectedAction = {
        type: 'auth/loginSuccess',
        payload: loginPayload,
      };
      expect(loginSuccess(loginPayload)).toEqual(expectedAction);
    });

    it('should create updateUser action', () => {
      const updatePayload = { name: 'New Name' };
      const expectedAction = {
        type: 'auth/updateUser',
        payload: updatePayload,
      };
      expect(updateUser(updatePayload)).toEqual(expectedAction);
    });

    it('should create updateTokens action', () => {
      const tokenPayload = {
        token: 'new-token',
        refreshToken: 'new-refresh-token',
      };
      const expectedAction = {
        type: 'auth/updateTokens',
        payload: tokenPayload,
      };
      expect(updateTokens(tokenPayload)).toEqual(expectedAction);
    });

    it('should create logout action', () => {
      const expectedAction = {
        type: 'auth/logout',
      };
      expect(logout()).toEqual(expectedAction);
    });

    it('should create clearError action', () => {
      const expectedAction = {
        type: 'auth/clearError',
      };
      expect(clearError()).toEqual(expectedAction);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple consecutive setLoading calls', () => {
      let state = authSlice(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);

      state = authSlice(state, setLoading(false));
      expect(state.isLoading).toBe(false);

      state = authSlice(state, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should clear error when setLoading is called with true', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Previous error',
      };

      const actual = authSlice(stateWithError, setLoading(true));
      expect(actual.error).toBe(null);
      expect(actual.isLoading).toBe(true);
    });

    it('should preserve other state when updating user', () => {
      const stateWithAuth: AuthState = {
        ...initialState,
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        lastLoginAt: '2023-01-01T00:00:00Z',
      };

      const actual = authSlice(stateWithAuth, updateUser({ name: 'New Name' }));

      expect(actual.token).toBe('token');
      expect(actual.refreshToken).toBe('refresh-token');
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.lastLoginAt).toBe('2023-01-01T00:00:00Z');
    });
  });
});
