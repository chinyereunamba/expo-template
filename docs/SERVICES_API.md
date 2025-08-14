# Services and API Documentation

This document covers the API integration, services layer, and data management patterns used in the Expo Mobile Skeleton app.

## Overview

The app uses a service layer pattern for API integration with the following key components:

- **API Client**: Centralized HTTP client with authentication and error handling
- **Service Layer**: Domain-specific API services (auth, user, etc.)
- **Token Management**: Secure token storage and automatic refresh
- **Network Monitoring**: Request/response logging and performance tracking
- **Error Handling**: Comprehensive error handling and user feedback

## API Client Architecture

### Base API Client

**Location**: `src/services/apiClient.ts`

The API client provides a centralized interface for all HTTP requests with built-in authentication, error handling, and request/response interceptors.

#### Features

- **Authentication**: Automatic token injection and refresh
- **Error Handling**: Centralized error processing and user-friendly messages
- **Request Interceptors**: Automatic request configuration and logging
- **Response Interceptors**: Response processing and error handling
- **Network Monitoring**: Request/response logging for debugging

#### Usage

```typescript
import { apiClient } from '@/services/apiClient';

// GET request
const users = await apiClient.get<User[]>('/users');

// POST request with data
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const updatedUser = await apiClient.put<User>(`/users/${id}`, userData);

// DELETE request
await apiClient.delete(`/users/${id}`);
```

#### Configuration

```typescript
// API client configuration
const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'API-Version': API_CONFIG.VERSION,
  },
});
```

## Authentication Service

### Auth API Service

**Location**: `src/services/authApi.ts`

Handles all authentication-related API calls including login, registration, token refresh, and password management.

#### Methods

```typescript
export const authApi = {
  // User authentication
  login: async (
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // User registration
  register: async (
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return response.data;
  },

  // Token refresh
  refreshToken: async (): Promise<
    ApiResponse<{ token: string; refreshToken: string }>
  > => {
    const response =
      await apiClient.post<
        ApiResponse<{ token: string; refreshToken: string }>
      >('/auth/refresh');
    return response.data;
  },

  // Password reset request
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  // Password reset confirmation
  resetPassword: async (resetData: {
    token: string;
    password: string;
  }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/reset-password',
      resetData
    );
    return response.data;
  },

  // User logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    userData: Partial<User>
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      '/user/profile',
      userData
    );
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/user/change-password',
      passwordData
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (
    formData: FormData
  ): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const response = await apiClient.upload<ApiResponse<{ avatarUrl: string }>>(
      '/user/avatar',
      formData
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      '/user/account',
      { body: { password } }
    );
    return response.data;
  },
};
```

#### React Query Hooks

The auth service also provides React Query hooks for easy integration with components:

```typescript
// Authentication hooks
export const useLogin = () => {
  const { loginSuccess, setError, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: data => {
      loginSuccess({
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = ErrorHandler.formatErrorForUser(error);
      setError(errorMessage);
      setLoading(false);
      ErrorHandler.logError(error, 'login');
    },
  });
};

export const useRegister = () => {
  // Similar implementation to useLogin
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      logout();
      queryClient.clear();
    },
  });
};

// Profile management hooks
export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: data => {
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

// Password management hooks
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onError: error => {
      ErrorHandler.logError(error, 'forgotPassword');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onError: error => {
      ErrorHandler.logError(error, 'resetPassword');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onError: error => {
      ErrorHandler.logError(error, 'changePassword');
    },
  });
};
```

#### Error Handling

```typescript
// Authentication error handling
try {
  await authService.login(credentials);
} catch (error) {
  if (error.status === 401) {
    // Invalid credentials
    showError('Invalid email or password');
  } else if (error.status === 429) {
    // Rate limiting
    showError('Too many login attempts. Please try again later.');
  } else {
    // Generic error
    showError('Login failed. Please try again.');
  }
}
```

## Token Management

### Token Manager

**Location**: `src/services/tokenManager.ts`

Handles secure storage and management of authentication tokens with automatic refresh capabilities.

#### Features

- **Secure Storage**: Uses Keychain (iOS) and Keystore (Android) for token storage
- **Automatic Refresh**: Handles token refresh before expiration
- **Token Validation**: Validates token format and expiration
- **Cleanup**: Secure token cleanup on logout

#### Methods

```typescript
export const tokenManager = {
  // Store tokens securely
  setTokens: async (
    accessToken: string,
    refreshToken: string
  ): Promise<void> => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  },

  // Retrieve access token
  getAccessToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync('accessToken');
  },

  // Retrieve refresh token
  getRefreshToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync('refreshToken');
  },

  // Check if token is valid
  isTokenValid: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  // Clear all tokens
  clearTokens: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },

  // Automatic token refresh
  refreshTokenIfNeeded: async (): Promise<string | null> => {
    const accessToken = await this.getAccessToken();

    if (!accessToken || !this.isTokenValid(accessToken)) {
      try {
        const response = await authService.refreshToken();
        return response.accessToken;
      } catch (error) {
        await this.clearTokens();
        throw error;
      }
    }

    return accessToken;
  },
};
```

## Network Monitoring

### Network Monitor

**Location**: `src/utils/networkMonitor.ts`

Provides comprehensive network monitoring and logging capabilities for debugging and performance analysis.

#### Features

- **Request Logging**: Log all outgoing requests with timing
- **Response Logging**: Log responses with status and performance metrics
- **Error Tracking**: Track and categorize network errors
- **Performance Metrics**: Monitor request/response times and sizes
- **Offline Detection**: Handle offline scenarios gracefully

#### Usage

```typescript
import { networkMonitor } from '@/utils/networkMonitor';

// Start monitoring
networkMonitor.start();

// Log request
networkMonitor.logRequest({
  id: 'req-123',
  url: '/api/users',
  method: 'GET',
  timestamp: Date.now(),
  headers: { Authorization: 'Bearer token' },
});

// Log response
networkMonitor.logResponse({
  id: 'req-123',
  status: 200,
  statusText: 'OK',
  duration: 150,
  size: 1024,
  timestamp: Date.now(),
});

// Log error
networkMonitor.logError({
  id: 'req-123',
  error: new Error('Network timeout'),
  timestamp: Date.now(),
});

// Get logs
const logs = networkMonitor.getLogs();

// Clear logs
networkMonitor.clear();
```

## API Integration Patterns

### Service Pattern

Each API domain has its own service file with related methods:

```typescript
// User Service
export const userService = {
  getProfile: () => apiClient.get<User>('/user/profile'),
  updateProfile: (data: UpdateProfileData) =>
    apiClient.put<User>('/user/profile', data),
  uploadAvatar: (file: File) =>
    apiClient.post<{ url: string }>('/user/avatar', file),
  deleteAccount: () => apiClient.delete('/user/account'),
};

// Notification Service
export const notificationService = {
  getNotifications: () => apiClient.get<Notification[]>('/notifications'),
  markAsRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  updateSettings: (settings: NotificationSettings) =>
    apiClient.put('/notifications/settings', settings),
};
```

### Repository Pattern

For complex data operations, use the repository pattern:

```typescript
// User Repository
class UserRepository {
  async getUser(id: string): Promise<User> {
    // Try cache first
    const cached = await cache.get(`user:${id}`);
    if (cached) return cached;

    // Fetch from API
    const user = await userService.getProfile();

    // Cache result
    await cache.set(`user:${id}`, user, { ttl: 300 });

    return user;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const user = await userService.updateProfile(data);

    // Update cache
    await cache.set(`user:${id}`, user);

    // Update store
    useAuthStore.getState().setUser(user);

    return user;
  }
}

export const userRepository = new UserRepository();
```

## Error Handling

### API Error Types

```typescript
// API Error interface
interface ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  timestamp: number;
}

// Error categories
enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
}
```

### Error Handler

```typescript
// Global error handler
export const handleApiError = (error: ApiError): string => {
  // Log error for debugging
  console.error('API Error:', error);

  // Report to crash reporting service
  crashReporter.reportError(error);

  // Return user-friendly message
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};
```

### Retry Logic

```typescript
// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Retry wrapper
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config = RETRY_CONFIG
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on non-retryable errors
      if (!config.retryableStatuses.includes(error.status)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve =>
        setTimeout(resolve, config.retryDelay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
};
```

## Caching Strategy

### Cache Implementation

```typescript
// Simple in-memory cache with TTL
class ApiCache {
  private cache = new Map<string, { data: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  async set<T>(
    key: string,
    data: T,
    options: { ttl: number } = { ttl: 300 }
  ): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + options.ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
```

### Cache Usage

```typescript
// Service with caching
export const userService = {
  async getProfile(): Promise<User> {
    const cacheKey = 'user:profile';

    // Try cache first
    const cached = await apiCache.get<User>(cacheKey);
    if (cached) return cached;

    // Fetch from API
    const user = await apiClient.get<User>('/user/profile');

    // Cache result
    await apiCache.set(cacheKey, user, { ttl: 300 });

    return user;
  },
};
```

## Testing API Services

### Service Testing

```typescript
// Mock API client for testing
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Test auth service
describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login should authenticate user', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    mockApiClient.post.mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(result).toEqual(mockResponse);
  });

  test('login should handle authentication error', async () => {
    mockApiClient.post.mockRejectedValue({
      status: 401,
      message: 'Invalid credentials',
    });

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      })
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    });
  });
});
```

### Integration Testing

```typescript
// Integration test with mock server
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('complete authentication flow', async () => {
  const result = await authService.login({
    email: 'test@example.com',
    password: 'password',
  });

  expect(result.user.email).toBe('test@example.com');
  expect(result.accessToken).toBeTruthy();
});
```

## Best Practices

### API Service Guidelines

1. **Consistent Interface**: Use consistent method names and patterns across services
2. **Error Handling**: Implement comprehensive error handling with user-friendly messages
3. **Type Safety**: Use TypeScript interfaces for all request/response data
4. **Caching**: Implement appropriate caching strategies for performance
5. **Testing**: Write comprehensive tests for all service methods

### Security Best Practices

1. **Token Security**: Store tokens securely using platform-specific secure storage
2. **HTTPS Only**: Always use HTTPS for API communications
3. **Input Validation**: Validate all input data before sending to API
4. **Error Information**: Don't expose sensitive information in error messages
5. **Rate Limiting**: Implement client-side rate limiting for API calls

### Performance Optimization

1. **Request Batching**: Batch multiple requests when possible
2. **Caching**: Cache frequently accessed data with appropriate TTL
3. **Compression**: Use request/response compression
4. **Pagination**: Implement pagination for large data sets
5. **Background Sync**: Sync data in background when app becomes active

This service layer provides a robust foundation for API integration with comprehensive error handling, security, and performance optimization.
