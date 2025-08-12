// Mock API server for testing
// This provides a simple mock server implementation for API testing

export interface MockApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
}

export interface MockApiError {
  message: string;
  status: number;
  code?: string;
}

class MockApiServer {
  private handlers: Map<string, any> = new Map();
  private delay: number = 0;

  // Set artificial delay for testing loading states
  setDelay(ms: number) {
    this.delay = ms;
  }

  // Register a mock handler for a specific endpoint
  on(method: string, path: string, handler: any) {
    const key = `${method.toUpperCase()} ${path}`;
    this.handlers.set(key, handler);
  }

  // Get handler for endpoint
  getHandler(method: string, path: string) {
    const key = `${method.toUpperCase()} ${path}`;
    return this.handlers.get(key);
  }

  // Clear all handlers
  clear() {
    this.handlers.clear();
  }

  // Mock successful response
  mockSuccess<T>(data: T, message = 'Success'): MockApiResponse<T> {
    return {
      data,
      success: true,
      message,
    };
  }

  // Mock error response
  mockError(message: string, status = 500, code?: string): MockApiError {
    return {
      message,
      status,
      code,
    };
  }

  // Simulate network delay
  async delay(ms?: number): Promise<void> {
    const delayTime = ms ?? this.delay;
    if (delayTime > 0) {
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
  }
}

// Create singleton instance
export const mockApiServer = new MockApiServer();

// Common mock responses
export const mockResponses = {
  // Auth responses
  loginSuccess: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
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
          profileVisibility: 'public' as const,
          showOnlineStatus: true,
        },
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },

  registerSuccess: {
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isEmailVerified: false,
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
          profileVisibility: 'public' as const,
          showOnlineStatus: true,
        },
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    token: 'mock-jwt-token-new',
    refreshToken: 'mock-refresh-token-new',
  },

  // Error responses
  invalidCredentials: {
    message: 'Invalid email or password',
    status: 401,
    code: 'INVALID_CREDENTIALS',
  },

  emailAlreadyExists: {
    message: 'Email already exists',
    status: 409,
    code: 'EMAIL_EXISTS',
  },

  networkError: {
    message: 'Network request failed',
    status: 0,
    code: 'NETWORK_ERROR',
  },

  serverError: {
    message: 'Internal server error',
    status: 500,
    code: 'SERVER_ERROR',
  },

  validationError: {
    message: 'Validation failed',
    status: 400,
    code: 'VALIDATION_ERROR',
    errors: {
      email: ['Email is required'],
      password: ['Password must be at least 8 characters'],
    },
  },
};

// Setup common mock endpoints
export const setupMockEndpoints = () => {
  // Auth endpoints
  mockApiServer.on('POST', '/auth/login', (data: any) => {
    if (data.email === 'john@example.com' && data.password === 'password123') {
      return mockApiServer.mockSuccess(mockResponses.loginSuccess);
    }
    throw mockApiServer.mockError('Invalid credentials', 401);
  });

  mockApiServer.on('POST', '/auth/register', (data: any) => {
    if (data.email === 'existing@example.com') {
      throw mockApiServer.mockError('Email already exists', 409);
    }
    return mockApiServer.mockSuccess(mockResponses.registerSuccess);
  });

  mockApiServer.on('POST', '/auth/logout', () => {
    return mockApiServer.mockSuccess({ message: 'Logged out successfully' });
  });

  mockApiServer.on('POST', '/auth/refresh', () => {
    return mockApiServer.mockSuccess({
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
    });
  });

  // User endpoints
  mockApiServer.on('GET', '/user/profile', () => {
    return mockApiServer.mockSuccess(mockResponses.loginSuccess.user);
  });

  mockApiServer.on('PUT', '/user/profile', (data: any) => {
    return mockApiServer.mockSuccess({
      ...mockResponses.loginSuccess.user,
      ...data,
      updatedAt: new Date().toISOString(),
    });
  });

  // Password endpoints
  mockApiServer.on('POST', '/auth/forgot-password', (data: any) => {
    return mockApiServer.mockSuccess({
      message: 'Password reset email sent',
    });
  });

  mockApiServer.on('POST', '/auth/reset-password', (data: any) => {
    if (!data.token || !data.password) {
      throw mockApiServer.mockError('Invalid reset token or password', 400);
    }
    return mockApiServer.mockSuccess({
      message: 'Password reset successfully',
    });
  });

  mockApiServer.on('POST', '/auth/change-password', (data: any) => {
    if (data.currentPassword !== 'password123') {
      throw mockApiServer.mockError('Current password is incorrect', 400);
    }
    return mockApiServer.mockSuccess({
      message: 'Password changed successfully',
    });
  });
};

// Test utilities
export const createMockFetch = () => {
  return jest
    .fn()
    .mockImplementation(async (url: string, options: any = {}) => {
      const method = options.method || 'GET';
      const path = url.replace(/^https?:\/\/[^\/]+/, ''); // Remove base URL

      await mockApiServer.delay();

      const handler = mockApiServer.getHandler(method, path);

      if (!handler) {
        throw new Error(`No mock handler found for ${method} ${path}`);
      }

      try {
        const body = options.body ? JSON.parse(options.body) : {};
        const result = handler(body);

        return {
          ok: true,
          status: 200,
          json: async () => result,
          text: async () => JSON.stringify(result),
        };
      } catch (error: any) {
        return {
          ok: false,
          status: error.status || 500,
          json: async () => error,
          text: async () => JSON.stringify(error),
        };
      }
    });
};

// Reset mock server for each test
export const resetMockServer = () => {
  mockApiServer.clear();
  mockApiServer.setDelay(0);
  setupMockEndpoints();
};

// Setup for tests
beforeEach(() => {
  resetMockServer();
});
