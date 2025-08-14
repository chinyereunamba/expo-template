# Utils and Hooks Documentation

This document covers the utility functions, custom hooks, and helper modules available in the Expo Mobile Skeleton app.

## Overview

The app includes a comprehensive collection of utilities and hooks organized by functionality:

- **Custom Hooks**: React hooks for common functionality
- **Utility Functions**: Helper functions for various operations
- **Validation**: Form validation and data validation utilities
- **Storage**: Data persistence and caching utilities
- **Performance**: Performance monitoring and optimization helpers
- **Testing**: Testing utilities and helpers

## Custom Hooks

### Theme Hook

**Location**: `src/hooks/useTheme.ts`

Provides access to the current theme and theme manipulation functions.

#### Features

- **Theme Access**: Get current theme colors, spacing, and typography
- **Theme Switching**: Toggle between light, dark, and system themes
- **Responsive Values**: Get theme values based on screen size
- **Theme Persistence**: Automatic theme preference persistence

#### Usage

```typescript
import { useTheme } from '@/hooks/useTheme';

const MyComponent = () => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Current theme: {isDark ? 'Dark' : 'Light'}
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
};
```

### Form Hooks

#### useForm Hook

**Location**: `src/hooks/useForm.ts`

A comprehensive form management hook with validation and error handling.

#### Features

- **Form State Management**: Handle form values and state
- **Validation**: Built-in and custom validation rules
- **Error Handling**: Field-level and form-level error management
- **Submission**: Form submission with loading states
- **Reset**: Form reset functionality

### Network Hooks

#### useNetworkMonitor Hook

**Location**: `src/hooks/useNetworkMonitor.ts`

Monitors network connectivity and provides network status information.

#### Features

- **Connection Status**: Real-time online/offline status
- **Connection Type**: WiFi, cellular, or other connection types
- **Speed Detection**: Estimate connection speed
- **Retry Logic**: Automatic retry for failed network requests

## Utility Functions

### Validation Utilities

**Location**: `src/utils/validation.ts`

Provides common validation functions for forms and data validation.

### Storage Utilities

**Location**: `src/utils/storage.ts`

Provides a unified interface for data storage with encryption support.

### Network Utilities

**Location**: `src/utils/network.ts`

Provides network-related utility functions.

### Crash Reporting Utilities

**Location**: `src/utils/crashReporter.tsx`

Comprehensive crash reporting system for React Native applications with automatic error capture, infinite loop prevention, and reporting.

#### Features

- **Global Error Handling**: Automatically captures unhandled errors and promise rejections
- **Infinite Loop Prevention**: Built-in protection against recursive error reporting
- **React Native Compatibility**: Uses React Native's `ErrorUtils.setGlobalHandler` for optimal error capture
- **Console Error Override**: Intercepts console.error calls to capture logged errors
- **Crash Storage**: Persists crash reports locally using AsyncStorage
- **Error Context**: Captures detailed context including screen, user, and device information
- **Statistics**: Provides crash analytics and statistics
- **External Integration**: Ready for integration with crash reporting services (Sentry, Crashlytics, etc.)
- **React Hook**: Provides `useCrashReporter` hook for component-level crash reporting
- **HOC Support**: Includes `withCrashReporting` higher-order component
- **Debug Mode Support**: Enhanced logging in debug mode with production-ready silent operation

#### Usage

```typescript
import { crashReporter, useCrashReporter } from '@/utils/crashReporter';

// Manual crash reporting
crashReporter.reportCrash(
  new Error('Something went wrong'),
  'User Action',
  { screen: 'HomeScreen', userId: '123' }
);

// Using the React hook
const MyCrashComponent = () => {
  const { crashes, stats, reportCrash, clearCrashes, testCrash } = useCrashReporter();

  return (
    <View>
      <Text>Total Crashes: {stats.total}</Text>
      <Text>Recent Crashes: {stats.recent}</Text>
      <Button title="Clear Crashes" onPress={clearCrashes} />
      <Button title="Test Crash" onPress={testCrash} />
    </View>
  );
};

// Using HOC for automatic crash reporting
const SafeComponent = withCrashReporting(MyComponent, 'MyComponent');
```

#### Global Error Handling

The crash reporter automatically sets up global error handlers with infinite loop prevention and enhanced type safety:

- **Console Error Override**: Captures errors logged to console.error with filtering to prevent loops
- **React Native ErrorUtils**: Uses properly typed `global.ErrorUtils.setGlobalHandler` for comprehensive error capture with TypeScript safety
- **Loop Prevention**: Tracks reporting state to prevent recursive error reporting
- **Smart Filtering**: Ignores crash reporter's own errors to prevent infinite loops
- **Type Safety**: Enhanced TypeScript definitions for React Native's global error handling system

#### Enhanced Error Capture

```typescript
// The crash reporter now intelligently captures errors from:
// 1. Console.error calls (filtered to avoid loops)
// 2. Global error handlers with proper TypeScript typing
// 3. Manual reporting
// 4. Component-level errors through HOC

// Example of automatic console error capture:
console.error(new Error('This will be automatically captured'));
console.error('String error: This will also be captured');

// Enhanced TypeScript support for React Native ErrorUtils:
if (typeof global !== 'undefined' && 'ErrorUtils' in global) {
  const globalWithErrorUtils = global as typeof global & {
    ErrorUtils: {
      setGlobalHandler: (
        handler: (error: Error, isFatal?: boolean) => void
      ) => void;
    };
  };

  globalWithErrorUtils.ErrorUtils.setGlobalHandler(
    (error: Error, isFatal?: boolean) => {
      // Type-safe error handling with proper parameter types
      crashReporter.reportCrash(
        error,
        isFatal ? 'Fatal Error' : 'Non-Fatal Error'
      );
    }
  );
}
```

#### TypeScript Strict Mode Compliance

The crash reporter has been enhanced with improved TypeScript strict mode compliance:

- **Exact Optional Properties**: Proper handling of optional properties with `exactOptionalPropertyTypes: true`
- **Undefined Handling**: Explicit undefined handling for optional context fields
- **Type Safety**: Enhanced type safety for error stack traces and context data
- **Strict Null Checks**: Compliant with strict null checking requirements

```typescript
// Enhanced context handling with strict TypeScript compliance
const crashReport: CrashReport = {
  id: this.generateCrashId(),
  timestamp: Date.now(),
  error: {
    name: error.name,
    message: error.message,
    stack: error.stack || undefined, // Explicit undefined for optional property
  },
  context: {
    screen: (additionalData?.screen as string | undefined) || undefined,
    action: context || undefined,
    userId: (additionalData?.userId as string | undefined) || undefined,
    appVersion: APP_CONFIG.VERSION,
    platform: Platform.OS,
  },
  deviceInfo: this.getDeviceInfo(),
  appState: additionalData?.appState as Record<string, unknown> | undefined,
};
```

#### Crash Report Structure

```typescript
interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    screen?: string;
    action?: string;
    userId?: string;
    appVersion: string;
    platform: string;
  };
  deviceInfo: {
    userAgent: string;
    language: string;
    timezone: string;
  };
  appState?: Record<string, unknown>;
}
```

#### Debug vs Production Behavior

- **Debug Mode**: Enhanced console logging, crash statistics updates, test crash functionality
- **Production Mode**: Silent operation with external crash service integration
- **Storage**: All crashes are stored locally regardless of mode for offline analysis

#### Testing and Development

```typescript
// Test crash reporting in development
crashReporter.testCrash();

// Export crashes for analysis
const crashData = crashReporter.exportCrashes();

// Get crash statistics
const stats = crashReporter.getCrashStats();
console.log('Most common errors:', stats.mostCommon);
console.log('Crashes by screen:', stats.byScreen);
```

### Testing Utilities

#### Test Helpers

**Location**: `src/utils/test-helpers.tsx`

Comprehensive testing utilities for component and integration testing, providing mock data, custom render functions, and testing helpers.

#### Test Server

**Location**: `src/utils/test-server.ts`

Mock API server implementation for testing API integrations and network scenarios.

#### Features

- **Mock Data**: Pre-configured mock objects for users, stores, and API responses
- **Custom Render**: Enhanced render function with provider wrapping
- **Store Mocking**: Mock implementations for Zustand stores
- **Navigation Mocking**: Mock navigation props and functions
- **API Mocking**: Utilities for mocking API responses and errors
- **Form Testing**: Helpers for testing form interactions
- **Async Testing**: Utilities for handling async operations in tests
- **Network Mocking**: Mock network status and connectivity
- **Storage Mocking**: Mock AsyncStorage operations
- **Assertion Helpers**: Common assertion utilities for testing

#### Mock Data Objects

```typescript
import { mockUser, mockAuthStore, mockAppStore } from '@/utils/test-helpers';

// Pre-configured user object with all required fields
const user = mockUser;

// Mock store implementations with jest functions
const authStore = mockAuthStore;
const appStore = mockAppStore;
```

#### Custom Render Function

```typescript
import { renderWithProviders } from '@/utils/test-helpers';

// Render with all providers
const { getByText } = renderWithProviders(<MyComponent />);

// Render with specific options
const { getByText } = renderWithProviders(<MyComponent />, {
  theme: 'dark',
  withNavigation: true,
  withQueryClient: true,
  initialEntries: ['/home']
});
```

#### Navigation Mocking

```typescript
import { mockNavigation, mockRoute } from '@/utils/test-helpers';

// Mock navigation object with all required methods
const navigation = mockNavigation;
const route = mockRoute;
```

#### API Response Mocking

```typescript
import {
  createMockApiResponse,
  createMockApiError,
} from '@/utils/test-helpers';

// Mock successful API response
const successResponse = createMockApiResponse({ users: [mockUser] });

// Mock API error response
const errorResponse = createMockApiError('User not found', 404);
```

#### Form Testing Helpers

```typescript
import { fillForm, waitForLoadingToFinish } from '@/utils/test-helpers';

// Fill form fields
await fillForm(getByPlaceholderText, {
  Email: 'test@example.com',
  Password: 'password123',
});

// Wait for async operations
await waitForLoadingToFinish();
```

#### Network and Storage Mocking

```typescript
import { mockNetworkStatus, mockAsyncStorage } from '@/utils/test-helpers';

// Mock network connectivity
const networkStatus = mockNetworkStatus;

// Mock AsyncStorage operations
const storage = mockAsyncStorage;
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
expectToBeVisible(element);
expectToHaveText(element, 'Expected Text');
expectToBeDisabled(button);
expectToBeEnabled(button);
```

### Test Server Utilities

**Location**: `src/utils/test-server.ts`

#### Mock API Server

The mock API server provides a comprehensive testing infrastructure for API interactions:

```typescript
import {
  mockApiServer,
  setupMockEndpoints,
  createMockFetch,
  mockResponses,
} from '@/utils/test-server';

// Setup mock endpoints with common authentication flows
setupMockEndpoints();

// Create mock fetch for testing
const mockFetch = createMockFetch();
global.fetch = mockFetch;

// Use pre-configured mock responses
const loginResponse = mockResponses.loginSuccess;
const errorResponse = mockResponses.invalidCredentials;
```

#### Mock Server Features

- **Endpoint Registration**: Register handlers for specific HTTP methods and paths
- **Response Simulation**: Mock successful and error responses with realistic data
- **Network Delay**: Simulate network latency for testing loading states
- **Error Scenarios**: Test various error conditions (401, 404, 500, network failures)
- **Request Validation**: Validate request data and return appropriate responses

#### Common Mock Endpoints

```typescript
// Authentication endpoints
mockApiServer.on('POST', '/auth/login', data => {
  if (data.email === 'john@example.com' && data.password === 'password123') {
    return mockApiServer.mockSuccess(mockResponses.loginSuccess);
  }
  throw mockApiServer.mockError('Invalid credentials', 401);
});

// User profile endpoints
mockApiServer.on('GET', '/user/profile', () => {
  return mockApiServer.mockSuccess(mockResponses.loginSuccess.user);
});

// Password reset endpoints
mockApiServer.on('POST', '/auth/forgot-password', _data => {
  return mockApiServer.mockSuccess({
    message: 'Password reset email sent',
  });
});
```

#### Error Simulation

```typescript
// Network error simulation
mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

// HTTP error simulation
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 401,
  json: async () => ({
    message: 'Unauthorized',
    status: 401,
  }),
});

// Timeout simulation
mockFetch.mockImplementationOnce(
  () =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 100)
    )
);
```

#### Integration with Tests

```typescript
describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockEndpoints();
  });

  it('should handle successful login', async () => {
    const response = await authApi.login({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(response.success).toBe(true);
    expect(response.data.user.email).toBe('john@example.com');
  });

  it('should handle login errors', async () => {
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
});
```

## Best Practices

### Hook Guidelines

1. **Single Responsibility**: Each hook should have a single, clear purpose
2. **Reusability**: Design hooks to be reusable across components
3. **Type Safety**: Use TypeScript for all hook parameters and return values
4. **Error Handling**: Implement proper error handling in hooks
5. **Testing**: Write comprehensive tests for custom hooks

### Utility Guidelines

1. **Pure Functions**: Utility functions should be pure when possible
2. **Error Handling**: Handle edge cases and errors gracefully
3. **Documentation**: Document complex utility functions
4. **Performance**: Optimize utilities for performance
5. **Testing**: Write unit tests for all utility functions
