# Test Server Documentation

This document covers the mock API server implementation used for testing API integrations and network scenarios in the Expo Mobile Skeleton app.

## Overview

The test server provides a comprehensive mock API implementation that simulates real backend behavior for testing purposes. It includes:

- **Mock API Server**: Centralized mock server with endpoint registration
- **Response Simulation**: Realistic success and error responses
- **Network Simulation**: Configurable delays and error conditions
- **Pre-configured Endpoints**: Common authentication and user management endpoints
- **Testing Integration**: Seamless integration with Jest and React Native Testing Library

## Mock API Server

### Location

**File**: `src/utils/test-server.ts`

### Core Components

#### MockApiServer Class

The main server class that handles endpoint registration and response generation:

```typescript
class MockApiServer {
  private handlers: Map<string, any> = new Map();
  private delay: number = 0;

  // Register endpoint handler
  on(method: string, path: string, handler: Function): void;

  // Get registered handler
  getHandler(method: string, path: string): Function | undefined;

  // Clear all handlers
  clear(): void;

  // Set network delay
  setDelay(ms: number): void;

  // Create success response
  mockSuccess<T>(data: T, message?: string): MockApiResponse<T>;

  // Create error response
  mockError(message: string, status?: number, code?: string): MockApiError;

  // Simulate network delay
  simulateDelay(ms?: number): Promise<void>;
}
```

#### Response Interfaces

```typescript
interface MockApiResponse<T = any> {
  data: T;
  success: boolean;
  message: string;
}

interface MockApiError {
  message: string;
  status: number;
  code?: string;
}
```

## Usage

### Basic Setup

```typescript
import {
  mockApiServer,
  setupMockEndpoints,
  createMockFetch,
  resetMockServer,
} from '@/utils/test-server';

// Setup for each test
beforeEach(() => {
  resetMockServer();
});

// Create mock fetch implementation
const mockFetch = createMockFetch();
global.fetch = mockFetch;
```

### Endpoint Registration

```typescript
// Register a simple GET endpoint
mockApiServer.on('GET', '/api/users', _data => {
  return mockApiServer.mockSuccess([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
  ]);
});

// Register POST endpoint with validation
mockApiServer.on('POST', '/api/users', data => {
  if (!data.email) {
    throw mockApiServer.mockError('Email is required', 400, 'VALIDATION_ERROR');
  }

  return mockApiServer.mockSuccess({
    id: '2',
    ...data,
    createdAt: new Date().toISOString(),
  });
});

// Register endpoint with conditional responses
mockApiServer.on('POST', '/auth/login', data => {
  if (data.email === 'john@example.com' && data.password === 'password123') {
    return mockApiServer.mockSuccess({
      user: { id: '1', email: 'john@example.com', name: 'John Doe' },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    });
  }

  throw mockApiServer.mockError(
    'Invalid credentials',
    401,
    'INVALID_CREDENTIALS'
  );
});
```

### Network Simulation

```typescript
// Set global delay for all requests
mockApiServer.setDelay(100); // 100ms delay

// Simulate specific delays
await mockApiServer.simulateDelay(500); // 500ms delay

// Simulate network errors
mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

// Simulate timeout
mockFetch.mockImplementationOnce(
  () =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 1000)
    )
);
```

## Pre-configured Endpoints

The `setupMockEndpoints()` function provides common endpoints for authentication and user management:

### Authentication Endpoints

```typescript
// Login endpoint
POST / auth / login;
// Success: Valid credentials (john@example.com / password123)
// Error: Invalid credentials (401)

// Registration endpoint
POST / auth / register;
// Success: New user registration
// Error: Email already exists (409) for existing@example.com

// Token refresh endpoint
POST / auth / refresh;
// Success: New tokens
// Error: Invalid refresh token (401)

// Logout endpoint
POST / auth / logout;
// Success: Logout confirmation

// Password reset request
POST / auth / forgot - password;
// Success: Reset email sent confirmation

// Password reset confirmation
POST / auth / reset - password;
// Success: Password reset with valid token
// Error: Invalid token or password (400)

// Change password
POST / auth / change - password;
// Success: Password changed with correct current password
// Error: Incorrect current password (400)
```

### User Management Endpoints

```typescript
// Get user profile
GET / user / profile;
// Success: User profile data

// Update user profile
PUT / user / profile;
// Success: Updated user data with timestamp
```

## Mock Responses

### Pre-configured Mock Data

```typescript
export const mockResponses = {
  // Successful login response
  loginSuccess: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, sms: false },
        privacy: { profileVisibility: 'public', showOnlineStatus: true },
      },
    },
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
  },

  // Registration response
  registerSuccess: {
    user: {
      /* similar structure */
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
};
```

## Testing Integration

### Component Testing

```typescript
import { renderWithProviders } from '@/utils/test-helpers';
import { createMockFetch, mockApiServer } from '@/utils/test-server';

const mockFetch = createMockFetch();
global.fetch = mockFetch;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockEndpoints();
  });

  it('should handle successful login', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen />,
      { withNavigation: true, withQueryClient: true }
    );

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Submit
    fireEvent.press(getByText('Login'));

    // Wait for success
    await waitFor(() => {
      expect(getByText('Login Successful')).toBeTruthy();
    });
  });

  it('should handle login errors', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen />,
      { withNavigation: true, withQueryClient: true }
    );

    // Fill form with invalid credentials
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');

    // Submit
    fireEvent.press(getByText('Login'));

    // Wait for error
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

### API Integration Testing

```typescript
import { authApi } from '@/services/authApi';
import { createMockFetch, setupMockEndpoints } from '@/utils/test-server';

const mockFetch = createMockFetch();
global.fetch = mockFetch;

describe('Auth API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockEndpoints();
  });

  it('should successfully login with valid credentials', async () => {
    const response = await authApi.login({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(response.success).toBe(true);
    expect(response.data.user.email).toBe('john@example.com');
    expect(response.data.token).toBe('mock-jwt-token');
  });

  it('should handle authentication errors', async () => {
    try {
      await authApi.login({
        email: 'john@example.com',
        password: 'wrongpassword',
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toBe('Invalid credentials');
    }
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    try {
      await authApi.login({
        email: 'john@example.com',
        password: 'password123',
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Network request failed');
    }
  });
});
```

### Custom Mock Scenarios

```typescript
describe('Custom API Scenarios', () => {
  it('should handle rate limiting', async () => {
    // Override default endpoint with rate limiting
    mockApiServer.on('POST', '/auth/login', _data => {
      throw mockApiServer.mockError('Too many requests', 429, 'RATE_LIMITED');
    });

    try {
      await authApi.login({ email: 'test@example.com', password: 'password' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.status).toBe(429);
      expect(error.message).toBe('Too many requests');
    }
  });

  it('should simulate slow network', async () => {
    mockApiServer.setDelay(2000); // 2 second delay

    const startTime = Date.now();
    await authApi.login({
      email: 'john@example.com',
      password: 'password123',
    });
    const endTime = Date.now();

    expect(endTime - startTime).toBeGreaterThanOrEqual(2000);
  });

  it('should handle malformed responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    try {
      await authApi.login({
        email: 'john@example.com',
        password: 'password123',
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Invalid JSON');
    }
  });
});
```

## Utility Functions

### createMockFetch()

Creates a Jest mock function that simulates the fetch API:

```typescript
const mockFetch = createMockFetch();

// Mock successful response
mockFetch.mockResolvedValueOnce({
  ok: true,
  status: 200,
  json: async () => ({ data: 'success' }),
});

// Mock error response
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 404,
  json: async () => ({ message: 'Not found' }),
});

// Mock network error
mockFetch.mockRejectedValueOnce(new Error('Network error'));
```

### setupMockEndpoints()

Sets up all pre-configured endpoints for common testing scenarios:

```typescript
setupMockEndpoints();
// Now all authentication and user management endpoints are available
```

### resetMockServer()

Resets the mock server to a clean state:

```typescript
resetMockServer();
// Clears all handlers, resets delay, and sets up default endpoints
```

## Best Practices

### Test Organization

1. **Reset Between Tests**: Always call `resetMockServer()` in `beforeEach`
2. **Clear Mocks**: Use `jest.clearAllMocks()` to reset Jest mocks
3. **Specific Scenarios**: Override default endpoints for specific test scenarios
4. **Error Testing**: Test both success and error scenarios
5. **Network Conditions**: Test various network conditions (slow, offline, timeout)

### Mock Data Management

1. **Consistent Data**: Use pre-configured mock responses for consistency
2. **Realistic Data**: Ensure mock data matches real API response structure
3. **Edge Cases**: Include edge cases in mock data (empty arrays, null values)
4. **Timestamps**: Use realistic timestamps in mock data
5. **Validation**: Mock validation errors for form testing

### Performance Testing

1. **Delay Simulation**: Use delays to test loading states
2. **Timeout Testing**: Test timeout scenarios with appropriate delays
3. **Large Responses**: Test with large mock responses to simulate real conditions
4. **Concurrent Requests**: Test multiple simultaneous requests

### Error Scenario Testing

1. **HTTP Errors**: Test all relevant HTTP status codes
2. **Network Errors**: Test network connectivity issues
3. **Timeout Errors**: Test request timeout scenarios
4. **Malformed Responses**: Test invalid JSON and response format errors
5. **Rate Limiting**: Test rate limiting and retry logic

The test server provides a robust foundation for testing API integrations with comprehensive mock capabilities and realistic error simulation.
