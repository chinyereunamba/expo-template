# Testing Documentation

This document covers the comprehensive testing setup, utilities, and best practices for the Expo Mobile Skeleton app.

## Overview

The app includes a complete testing infrastructure with:

- **Unit Testing**: Component and utility function testing
- **Integration Testing**: Feature and workflow testing
- **Test Utilities**: Comprehensive testing helpers and mocks
- **Performance Testing**: Performance monitoring and optimization testing
- **Accessibility Testing**: Screen reader and accessibility compliance testing

## Testing Stack

### Core Testing Libraries

- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing utilities
- **@testing-library/jest-native**: Additional Jest matchers for React Native
- **MSW (Mock Service Worker)**: API mocking for integration tests

### Configuration

**Jest Configuration**: `jest.config.js`

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/src/utils/test-setup.ts',
    '<rootDir>/src/utils/test-helpers.tsx',
  ],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Test Utilities

### Test Helpers

**Location**: `src/utils/test-helpers.tsx`

The test helpers provide a comprehensive set of utilities for testing React Native components and functionality.

#### Mock Data

```typescript
import { mockUser, mockAuthStore, mockAppStore } from '@/utils/test-helpers';

// Complete user object with all required fields
const user = mockUser;
// Includes: id, name, email, preferences, timestamps

// Mock store implementations with jest functions
const authStore = mockAuthStore;
const appStore = mockAppStore;
```

#### Custom Render Function

```typescript
import { renderWithProviders } from '@/utils/test-helpers';

// Basic render with all providers
const { getByText, getByTestId } = renderWithProviders(<MyComponent />);

// Advanced render with specific options
const { getByText } = renderWithProviders(<MyComponent />, {
  theme: 'dark',                    // 'light' | 'dark'
  withNavigation: true,             // Include NavigationContainer
  withQueryClient: true,            // Include QueryClientProvider
  initialEntries: ['/home', '/profile'] // Navigation routes
});
```

#### Navigation Mocking

```typescript
import { mockNavigation, mockRoute } from '@/utils/test-helpers';

// Mock navigation object with all required methods
const navigation = mockNavigation;
// Includes: navigate, goBack, reset, setParams, etc.

// Mock route object
const route = mockRoute;
// Includes: key, name, params
```

#### API Response Mocking

```typescript
import {
  createMockApiResponse,
  createMockApiError,
} from '@/utils/test-helpers';

// Mock successful API response
const successResponse = createMockApiResponse(
  { users: [mockUser] },
  true // success flag
);

// Mock API error response
const errorResponse = createMockApiError(
  'User not found',
  404 // status code
);
```

#### Form Testing Helpers

```typescript
import { fillForm, waitForLoadingToFinish } from '@/utils/test-helpers';

// Fill multiple form fields
await fillForm(getByPlaceholderText, {
  Email: 'test@example.com',
  Password: 'password123',
  'Confirm Password': 'password123',
});

// Wait for async operations to complete
await waitForLoadingToFinish();
```

#### Network and Storage Mocking

```typescript
import { mockNetworkStatus, mockAsyncStorage } from '@/utils/test-helpers';

// Mock network connectivity
const networkStatus = mockNetworkStatus;
// Includes: isConnected, type, details

// Mock AsyncStorage operations
const storage = mockAsyncStorage;
// Includes: getItem, setItem, removeItem, clear
```

#### Assertion Helpers

```typescript
import {
  expectToBeVisible,
  expectToHaveText,
  expectToBeDisabled,
  expectToBeEnabled,
} from '@/utils/test-helpers';

// Common assertions
expectToBeVisible(getByTestId('submit-button'));
expectToHaveText(getByTestId('title'), 'Welcome');
expectToBeDisabled(getByTestId('submit-button'));
expectToBeEnabled(getByTestId('cancel-button'));
```

### Test Setup

**Location**: `src/utils/test-setup.ts`

Global test configuration and setup:

```typescript
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000',
        environment: 'test',
      },
    },
  },
}));
```

### Test Server

**Location**: `src/utils/test-server.ts`

Mock API server for testing with comprehensive endpoint mocking:

```typescript
import {
  mockApiServer,
  setupMockEndpoints,
  createMockFetch,
  resetMockServer,
} from '@/utils/test-server';

// Setup mock server for tests
beforeEach(() => {
  resetMockServer();
});

// Create mock fetch implementation
const mockFetch = createMockFetch();
global.fetch = mockFetch;

// Mock API endpoints
setupMockEndpoints();

// Custom endpoint mocking
mockApiServer.on('GET', '/api/users', _data => {
  return mockApiServer.mockSuccess([mockUser]);
});

mockApiServer.on('POST', '/api/login', data => {
  if (data.email === 'valid@example.com') {
    return mockApiServer.mockSuccess({ token: 'mock-token', user: mockUser });
  }
  throw mockApiServer.mockError('Invalid credentials', 401);
});
```

#### Mock Server Features

- **Endpoint Registration**: Register mock handlers for specific HTTP methods and paths
- **Response Mocking**: Create consistent success and error responses
- **Network Delay Simulation**: Simulate network latency for testing loading states
- **Error Simulation**: Mock various error conditions (network, server, validation)
- **Request Logging**: Log requests for debugging test scenarios

#### Mock Server API

```typescript
// Mock successful response
const successResponse = mockApiServer.mockSuccess(data, 'Success message');

// Mock error response
const errorResponse = mockApiServer.mockError(
  'Error message',
  400,
  'ERROR_CODE'
);

// Set network delay
mockApiServer.setDelay(100); // 100ms delay

// Clear all handlers
mockApiServer.clear();

// Simulate network delay
await mockApiServer.simulateDelay(200);
```

For detailed information about the test server implementation, see [Test Server Documentation](TEST_SERVER.md).

## Testing Patterns

### Component Testing

#### Basic Component Test

```typescript
import React from 'react';
import { renderWithProviders } from '@/utils/test-helpers';
import { Button } from '@/components/common/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(
      <Button title="Test Button" onPress={jest.fn()} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <Button title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = renderWithProviders(
      <Button title="Test Button" onPress={jest.fn()} loading />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

#### Screen Testing

```typescript
import React from 'react';
import { renderWithProviders, mockNavigation } from '@/utils/test-helpers';
import { HomeScreen } from '@/screens/home/HomeScreen';

describe('HomeScreen', () => {
  const navigation = mockNavigation;

  it('renders home screen content', () => {
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={navigation} />,
      { withNavigation: true, withQueryClient: true }
    );

    expect(getByText('Welcome')).toBeTruthy();
  });

  it('navigates to details screen', () => {
    const { getByText } = renderWithProviders(
      <HomeScreen navigation={navigation} />,
      { withNavigation: true }
    );

    fireEvent.press(getByText('View Details'));
    expect(navigation.navigate).toHaveBeenCalledWith('Details');
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '@/hooks/useForm';

describe('useForm Hook', () => {
  it('manages form state correctly', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        validationSchema: emailPasswordSchema,
      })
    );

    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('validates form fields', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        validationSchema: emailPasswordSchema,
      })
    );

    await act(async () => {
      result.current.setFieldValue('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });
});
```

### Store Testing

```typescript
import { useAuthStore } from '@/store/authStore';
import { mockUser } from '@/utils/test-helpers';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('handles login correctly', () => {
    const store = useAuthStore.getState();

    store.loginSuccess({
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    });

    expect(store.user).toEqual(mockUser);
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('mock-token');
    expect(store.refreshToken).toBe('mock-refresh-token');
    expect(store.lastLoginAt).toBeTruthy();
  });

  it('handles logout correctly', () => {
    const store = useAuthStore.getState();

    // First login
    store.loginSuccess({
      user: mockUser,
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    });

    // Then logout
    store.logout();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.refreshToken).toBeNull();
  });

  it('handles token expiration correctly', () => {
    const store = useAuthStore.getState();

    // Mock expired token
    store.updateTokens({
      token: 'expired-token',
      refreshToken: 'refresh-token',
    });

    const isExpired = store.isTokenExpired();
    expect(isExpired).toBe(true);
  });
});
```

### Integration Testing

```typescript
import React from 'react';
import { renderWithProviders, fillForm, waitForLoadingToFinish } from '@/utils/test-helpers';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { createMockFetch, mockApiServer } from '@/utils/test-server';

// Mock the global fetch
const mockFetch = createMockFetch();
global.fetch = mockFetch;

describe('Login Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes login flow successfully', async () => {
    // Mock successful login API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiServer.mockSuccess({
        token: 'mock-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      }),
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen />,
      { withNavigation: true, withQueryClient: true }
    );

    // Fill login form
    await fillForm(getByPlaceholderText, {
      'Email': 'test@example.com',
      'Password': 'password123'
    });

    // Submit form
    fireEvent.press(getByText('Login'));

    // Wait for async operations
    await waitForLoadingToFinish();

    // Verify success state
    expect(getByText('Login Successful')).toBeTruthy();
  });

  it('handles login errors correctly', async () => {
    // Mock failed login API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: 'Invalid credentials',
        status: 401,
      }),
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen />,
      { withNavigation: true, withQueryClient: true }
    );

    // Fill login form
    await fillForm(getByPlaceholderText, {
      'Email': 'test@example.com',
      'Password': 'wrongpassword'
    });

    // Submit form
    fireEvent.press(getByText('Login'));

    // Wait for async operations
    await waitForLoadingToFinish();

    // Verify error state
    expect(getByText('Invalid credentials')).toBeTruthy();
  });
});

// API Integration Testing
describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockEndpoints();
  });

  it('should successfully login with valid credentials', async () => {
    const loginData = {
      email: 'john@example.com',
      password: 'password123',
    };

    const response = await authApi.login(loginData);

    expect(response.success).toBe(true);
    expect(response.data.user.email).toBe('john@example.com');
    expect(response.data.token).toBe('mock-jwt-token');
    expect(response.data.refreshToken).toBe('mock-refresh-token');
  });

  it('should handle authentication errors', async () => {
    const loginData = {
      email: 'john@example.com',
      password: 'wrongpassword',
    };

    try {
      await authApi.login(loginData);
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const apiError = error as { status: number; message: string };
      expect(apiError.status).toBe(401);
      expect(apiError.message).toBe('Invalid credentials');
    }
  });

  it('should handle network errors during API calls', async () => {
    // Mock network failure
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    const loginData = {
      email: 'john@example.com',
      password: 'password123',
    };

    try {
      await authApi.login(loginData);
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const apiError = error as { message: string };
      expect(apiError.message).toBe('Network request failed');
    }
  });

  it('should handle server errors (500)', async () => {
    // Mock 500 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Internal server error',
        status: 500,
      }),
    });

    try {
      await apiClient.get('/server-error-endpoint');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const apiError = error as { status: number; message: string };
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Internal server error');
    }
  });

  it('should handle rate limiting (429)', async () => {
    // Mock rate limit response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        message: 'Too many requests',
        status: 429,
        retryAfter: 60,
      }),
    });

    try {
      await apiClient.get('/rate-limited-endpoint');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const apiError = error as { status: number; message: string };
      expect(apiError.status).toBe(429);
      expect(apiError.message).toBe('Too many requests');
    }
  });

  it('should handle request timeouts', async () => {
    // Mock timeout
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
    );

    try {
      await apiClient.get('/timeout-endpoint');
      fail('Should have thrown an error');
    } catch (error: unknown) {
      const apiError = error as { message: string };
      expect(apiError.message).toBe('Request timeout');
    }
  });
});
```

## Testing Commands

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run tests for specific directory
npm test -- src/components

# Run tests with verbose output
npm test -- --verbose
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Best Practices

### Test Organization

1. **File Structure**: Place tests in `__tests__` directories or use `.test.tsx` suffix
2. **Descriptive Names**: Use clear, descriptive test names
3. **Group Related Tests**: Use `describe` blocks to group related tests
4. **Setup and Teardown**: Use `beforeEach`, `afterEach` for test setup

### Component Testing

1. **Test User Interactions**: Focus on user-facing behavior
2. **Mock External Dependencies**: Mock APIs, navigation, and external services
3. **Test Accessibility**: Include accessibility testing in component tests
4. **Test Error States**: Test error handling and edge cases

### Integration Testing

1. **Test Complete Workflows**: Test end-to-end user workflows
2. **Mock External Services**: Use MSW for API mocking
3. **Test State Changes**: Verify state changes across components
4. **Test Navigation**: Test navigation flows and route changes

### Performance Testing

1. **Test Render Performance**: Monitor component render times
2. **Test Memory Usage**: Check for memory leaks
3. **Test Bundle Size**: Monitor bundle size impact
4. **Test Async Operations**: Test async operation performance

### Accessibility Testing

1. **Screen Reader Testing**: Test with screen reader compatibility
2. **Keyboard Navigation**: Test keyboard navigation support
3. **Color Contrast**: Test color contrast compliance
4. **Focus Management**: Test focus management and order

## Troubleshooting

### Common Issues

1. **Tests Timing Out**
   - Increase timeout values
   - Use `waitFor` for async operations
   - Check for infinite loops

2. **Mock Issues**
   - Verify mock implementations
   - Check mock reset between tests
   - Ensure proper mock cleanup

3. **Navigation Testing**
   - Use `renderWithProviders` with `withNavigation: true`
   - Mock navigation props correctly
   - Test navigation state changes

4. **Store Testing**
   - Reset store state between tests
   - Use proper store mocking
   - Test store subscriptions

### Debug Commands

```bash
# Run tests with debugging
npm test -- --detectOpenHandles

# Run single test with debugging
npm test -- --testNamePattern="specific test" --verbose

# Check test coverage
npm run test:coverage -- --watchAll=false

# Run tests with specific timeout
npm test -- --testTimeout=10000
```

## Continuous Integration

### GitHub Actions

The project includes CI/CD configuration for automated testing:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Quality Gates

- **Code Coverage**: Minimum 80% coverage required
- **Linting**: All ESLint rules must pass
- **Type Checking**: TypeScript compilation must succeed
- **Test Execution**: All tests must pass

The comprehensive testing setup ensures high code quality and reliability across the entire application.
