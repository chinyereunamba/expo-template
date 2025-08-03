import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginPayload, UpdateUserPayload } from '../../types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginAt: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set authentication error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Login success
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.lastLoginAt = new Date().toISOString();
    },

    // Update user profile
    updateUser: (state, action: PayloadAction<UpdateUserPayload>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update tokens (for refresh)
    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },

    // Logout
    logout: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginAt = null;
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  loginSuccess,
  updateUser,
  updateTokens,
  logout,
  clearError,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
