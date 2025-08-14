# Store Documentation

This document covers the state management architecture using Zustand stores in the Expo Mobile Skeleton app.

## Overview

The app uses Zustand for state management, providing a lightweight, type-safe, and performant solution for managing application state. The store architecture follows these principles:

- **Type Safety**: Full TypeScript support with strict typing
- **Persistence**: Automatic state persistence with AsyncStorage
- **DevTools**: Development debugging integration
- **Modularity**: Separate stores for different domains
- **Performance**: Optimized for React Native performance

## Store Architecture

### Store Structure

```
src/store/
├── index.ts           # Store exports and utilities
├── authStore.ts       # Authentication state management
├── appStore.ts        # Application-wide settings
└── networkStore.ts    # Network connectivity state
```

## Authentication Store

**Location**: `src/store/authStore.ts`

The authentication store manages user authentication state, tokens, and user profile information.

### State Interface

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAt: string | null;
}

interface AuthStore extends AuthState {
  // State setters
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Authentication actions
  loginSuccess: (payload: LoginPayload) => void;
  logout: () => void;

  // User management
  updateUser: (payload: UpdateUserPayload) => void;

  // Token management
  updateTokens: (tokens: { token: string; refreshToken: string }) => void;
  isTokenExpired: () => boolean;

  // Utility actions
  clearError: () => void;
  hydrate: () => Promise<void>;
}
```

### Store Implementation

```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    devtools(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastLoginAt: null,

        // Loading state management
        setLoading: (loading: boolean) =>
          set(
            state => ({
              isLoading: loading,
              error: loading ? null : state.error,
            }),
            false
          ),

        // Error state management
        setError: (error: string | null) =>
          set(
            {
              error,
              isLoading: false,
            },
            false
          ),

        // Successful login handler
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
            false
          );
        },

        // User profile updates
        updateUser: (payload: UpdateUserPayload) =>
          set(
            state => ({
              user: state.user ? { ...state.user, ...payload } : null,
            }),
            false
          ),

        // Token updates (for refresh)
        updateTokens: (tokens: { token: string; refreshToken: string }) =>
          set(
            {
              token: tokens.token,
              refreshToken: tokens.refreshToken,
            },
            false
          ),

        // Logout handler
        logout: () => {
          set(
            {
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              lastLoginAt: null,
            },
            false
          );
        },

        // Clear error state
        clearError: () =>
          set(
            {
              error: null,
            },
            false
          ),

        // Token expiration check with enhanced error handling
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

        // Hydrate state from storage
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
```

### Usage Examples

```typescript
// In components
import { useAuthStore } from '@/store/authStore';

const LoginScreen = () => {
  const {
    isLoading,
    error,
    loginSuccess,
    setLoading,
    setError
  } = useAuthStore();

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      loginSuccess({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View>
      {isLoading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <LoginForm onSubmit={handleLogin} />
    </View>
  );
};

// Accessing state outside components
const token = useAuthStore.getState().token;
const isAuthenticated = useAuthStore.getState().isAuthenticated;

// Subscribing to state changes
useAuthStore.subscribe(
  state => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Handle authentication state change
    }
  }
);
```

## Application Store

**Location**: `src/store/appStore.ts`

Manages application-wide settings and preferences.

### State Interface

```typescript
interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  onboardingCompleted: boolean;
  lastAppVersion: string | null;
}

interface AppStore extends AppState {
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  completeOnboarding: () => void;
  updateAppVersion: (version: string) => void;
}
```

### Usage

```typescript
import { useAppStore } from '@/store/appStore';

const SettingsScreen = () => {
  const { theme, setTheme, language, setLanguage } = useAppStore();

  return (
    <View>
      <ThemePicker value={theme} onChange={setTheme} />
      <LanguagePicker value={language} onChange={setLanguage} />
    </View>
  );
};
```

## Network Store

**Location**: `src/store/networkStore.ts`

Manages network connectivity state and retry logic.

### State Interface

```typescript
interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  retryCount: number;
  lastConnectedAt: string | null;
}

interface NetworkStore extends NetworkState {
  updateNetworkStatus: (status: NetworkStatus) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
}
```

### Usage

```typescript
import { useNetworkStore } from '@/store/networkStore';

const ApiComponent = () => {
  const { isConnected, retryCount, incrementRetryCount } = useNetworkStore();

  const handleApiCall = async () => {
    if (!isConnected) {
      showOfflineMessage();
      return;
    }

    try {
      await apiCall();
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') {
        incrementRetryCount();
      }
    }
  };

  return (
    <View>
      {!isConnected && <OfflineBanner />}
      <Button onPress={handleApiCall} disabled={!isConnected} />
    </View>
  );
};
```

## Store Middleware

### DevTools Integration

The stores include DevTools integration for development debugging:

```typescript
import { devtools, stateInspector } from '../utils/zustandDevtools';

// Register store with state inspector
stateInspector.registerStore('AuthStore', useAuthStore);

// DevTools middleware provides:
// - Action tracking and naming
// - State inspection and time travel
// - Performance monitoring
// - State diff visualization
```

### Persistence Middleware

Automatic state persistence with AsyncStorage:

```typescript
// Persistence configuration
{
  name: 'auth-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: state => ({
    // Only persist specific fields
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    lastLoginAt: state.lastLoginAt,
  }),
  onRehydrateStorage: () => state => {
    // Post-hydration logic
    if (state) {
      state.isTokenExpired();
    }
  },
}
```

## Best Practices

### Store Design

1. **Single Responsibility**: Each store manages a specific domain
2. **Immutable Updates**: Always use immutable state updates
3. **Type Safety**: Use TypeScript interfaces for all state and actions
4. **Selective Persistence**: Only persist necessary state fields
5. **Error Handling**: Include proper error state management

### Performance Optimization

1. **Selective Subscriptions**: Subscribe to specific state slices
2. **Computed Values**: Use selectors for derived state
3. **Batch Updates**: Batch related state updates
4. **Shallow Comparison**: Use shallow comparison for object updates

```typescript
// Good: Selective subscription
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Good: Computed selector
const userDisplayName = useAuthStore(state =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : 'Guest'
);

// Good: Batch updates
set(state => ({
  ...state,
  user: updatedUser,
  lastUpdatedAt: new Date().toISOString(),
}));
```

### Testing Stores

```typescript
import { useAuthStore } from '@/store/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().logout();
  });

  it('handles login success', () => {
    const store = useAuthStore.getState();

    store.loginSuccess({
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    });

    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(mockUser);
    expect(store.error).toBeNull();
  });

  it('handles token expiration', () => {
    const store = useAuthStore.getState();

    // Mock expired token
    jest.spyOn(store, 'isTokenExpired').mockReturnValue(true);

    const isExpired = store.isTokenExpired();
    expect(isExpired).toBe(true);
    expect(store.isAuthenticated).toBe(false);
  });
});
```

### Error Handling

```typescript
// Store error handling patterns
const handleAsyncAction = async (action: () => Promise<void>) => {
  set({ isLoading: true, error: null });

  try {
    await action();
    set({ isLoading: false });
  } catch (error) {
    set({
      isLoading: false,
      error: error.message || 'An error occurred',
    });
  }
};
```

## Migration and Updates

### Store Migration

When updating store structure, use migration utilities:

```typescript
// Migration helper
const migrateAuthStore = (persistedState: any, version: number) => {
  if (version < 2) {
    // Migrate from version 1 to 2
    return {
      ...persistedState,
      lastLoginAt: null, // Add new field
    };
  }
  return persistedState;
};

// Apply migration
{
  name: 'auth-storage',
  version: 2,
  migrate: migrateAuthStore,
  // ... other config
}
```

### Breaking Changes

When making breaking changes to stores:

1. **Version the store**: Increment version number
2. **Provide migration**: Include migration logic
3. **Test thoroughly**: Test migration with existing data
4. **Document changes**: Update documentation and changelog

This store architecture provides a robust, type-safe, and performant state management solution for the React Native application.
