# Development Tools Documentation

This document covers all development tools, debugging utilities, and development workflow features available in the Expo Mobile Skeleton app.

## Overview

The app includes comprehensive development tools to enhance the developer experience:

- **Debug Menu**: In-app debugging interface
- **Logging System**: Structured logging with context
- **Performance Monitoring**: Memory and performance tracking
- **Network Monitoring**: API request/response tracking
- **State Inspection**: Real-time state debugging
- **Crash Reporting**: Error tracking and reporting
- **Testing Utilities**: Comprehensive testing helpers

## Debug Menu (DevMenu)

### Overview

The DevMenu is a floating debug interface that provides quick access to development tools during app development.

**Location**: `src/components/common/DevMenu.tsx`

### Features

#### 1. Screen View Logging

- Logs screen view events with context
- Tracks user navigation patterns
- Useful for analytics implementation testing

#### 2. Crash Testing

- Generates test crash reports
- Validates crash reporting integration
- Tests error handling workflows

#### 3. Network Log Management

- Clears network request logs
- Monitors API call history
- Debugs network-related issues

#### 4. State Inspection

- Exports current app state
- Inspects Zustand store contents
- Debugs state management issues

#### 5. Memory Monitoring

- Checks current memory usage
- Identifies memory leaks
- Monitors performance metrics

### Usage

```typescript
import { DevMenu } from '@/components/common/DevMenu';

// Add to any screen for debugging
<Screen>
  {/* Your screen content */}
  <DevMenu screenName="HomeScreen" />
</Screen>
```

### Interface

- **Floating Button**: 🐛 icon in bottom-right corner
- **Modal Interface**: Slide-up modal with debug options
- **Auto-Hide**: Only visible in development mode
- **Theme Integration**: Respects current theme settings

## Logging System

### AppLogger

**Location**: `src/utils/logger.ts`

#### Features

- **Contextual Logging**: Set context for related log entries
- **Log Levels**: Debug, info, warn, error levels
- **User Actions**: Track user interactions
- **Performance Metrics**: Log performance data
- **Memory Usage**: Monitor memory consumption

#### Usage

```typescript
import { AppLogger } from '@/utils/logger';

// Set context for related logs
const logger = AppLogger.setContext('HomeScreen');

// Log user actions
logger.logUserAction('Button Press', { button: 'login' });

// Log performance metrics
logger.logPerformance('Screen Load', { duration: 250 });

// Log errors with context
logger.error('API Error', { endpoint: '/users', status: 500 });

// Log memory usage
AppLogger.logMemoryUsage();
```

#### Configuration

```typescript
// Development: All logs visible
// Production: Only warn and error logs

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
```

## Performance Monitoring

### Performance Monitor Hook

**Location**: `src/hooks/usePerformanceMonitor.ts`

#### Features

- **Render Tracking**: Monitor component render times
- **Memory Monitoring**: Track memory usage patterns
- **Performance Metrics**: Collect performance data
- **Optimization Suggestions**: Identify performance bottlenecks

#### Usage

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  const { startTimer, endTimer, logMemoryUsage } = usePerformanceMonitor();

  useEffect(() => {
    startTimer('component-mount');

    // Component initialization logic

    endTimer('component-mount');
    logMemoryUsage('MyComponent');
  }, []);

  return <View>{/* Component content */}</View>;
};
```

### Memory Management

**Location**: `src/utils/memoryManagement.ts`

#### Features

- **Memory Leak Detection**: Identify potential memory leaks
- **Cleanup Utilities**: Automatic cleanup helpers
- **Memory Monitoring**: Real-time memory usage tracking
- **Performance Optimization**: Memory optimization strategies

#### Usage

```typescript
import { memoryManager } from '@/utils/memoryManagement';

// Monitor memory usage
memoryManager.startMonitoring();

// Clean up resources
memoryManager.cleanup();

// Check for memory leaks
memoryManager.detectLeaks();
```

## Network Monitoring

### Network Monitor

**Location**: `src/utils/networkMonitor.ts`

#### Features

- **Request Tracking**: Log all API requests
- **Response Monitoring**: Track response times and status
- **Error Logging**: Capture network errors
- **Performance Metrics**: Monitor network performance
- **Offline Detection**: Handle offline scenarios

#### Usage

```typescript
import { networkMonitor } from '@/utils/networkMonitor';

// Start monitoring
networkMonitor.start();

// Log request
networkMonitor.logRequest({
  url: '/api/users',
  method: 'GET',
  timestamp: Date.now(),
});

// Log response
networkMonitor.logResponse({
  url: '/api/users',
  status: 200,
  duration: 150,
  size: 1024,
});

// Clear logs
networkMonitor.clear();
```

### Network Status Hook

**Location**: `src/hooks/useNetworkMonitor.ts`

#### Features

- **Connection Status**: Real-time connectivity monitoring
- **Connection Type**: WiFi, cellular, or offline detection
- **Speed Monitoring**: Network speed estimation
- **Retry Logic**: Automatic retry for failed requests

#### Usage

```typescript
import { useNetworkMonitor } from '@/hooks/useNetworkMonitor';

const MyComponent = () => {
  const {
    isOnline,
    connectionType,
    isSlowConnection,
    retryFailedRequests
  } = useNetworkMonitor();

  if (!isOnline) {
    return <OfflineMessage />;
  }

  return <OnlineContent />;
};
```

## State Inspection

### Zustand DevTools

**Location**: `src/utils/zustandDevtools.ts`

#### Features

- **State Inspection**: Real-time state monitoring
- **Action Tracking**: Track state changes and actions
- **Time Travel**: Debug state changes over time
- **State Export**: Export current state for debugging

#### Usage

```typescript
import { stateInspector } from '@/utils/zustandDevtools';

// Export current state
const currentState = stateInspector.exportState();

// Log state changes
stateInspector.logStateChange('auth', { user: newUser });

// Reset state for testing
stateInspector.resetState('auth');
```

### Store Debugging

```typescript
// In your Zustand store
import { subscribeWithSelector } from 'zustand/middleware';

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Store implementation
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        // Enable debugging in development
        onRehydrateStorage: () => state => {
          if (__DEV__) {
            console.log('Auth store rehydrated:', state);
          }
        },
      }
    )
  )
);
```

## Crash Reporting

### Crash Reporter

**Location**: `src/utils/crashReporter.tsx`

#### Features

- **Infinite Loop Prevention**: Built-in protection against recursive error reporting
- **React Native Compatible Error Capture**: Uses `global.ErrorUtils.setGlobalHandler` for optimal React Native error handling
- **Smart Console Error Override**: Intelligently captures console errors while preventing self-reporting loops
- **Global Error Handling**: Automatically captures unhandled errors and promise rejections
- **Context Collection**: Gathers comprehensive error context including screen, user, and device information
- **Local Storage**: Persists crash reports using AsyncStorage for offline analysis
- **Statistics & Analytics**: Provides crash statistics and analytics
- **External Service Integration**: Ready for integration with Sentry, Crashlytics, Bugsnag, etc.
- **React Hook Support**: Includes `useCrashReporter` hook for component-level integration
- **HOC Support**: Provides `withCrashReporting` higher-order component
- **Debug Mode Support**: Enhanced logging in debug mode with production-ready silent operation
- **Test Crash Functionality**: Built-in test crash generation for development

#### Global Error Handling Setup

The crash reporter automatically configures React Native compatible error handlers with infinite loop prevention:

```typescript
// React Native ErrorUtils integration with loop prevention
if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
  const originalHandler = (global as any).ErrorUtils.setGlobalHandler;
  (global as any).ErrorUtils.setGlobalHandler(
    (error: Error, isFatal?: boolean) => {
      if (!this.isReporting) {
        this.reportCrash(error, isFatal ? 'Fatal Error' : 'Non-Fatal Error');
      }
      // Call original handler if it exists
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    }
  );
}

// Smart console error override with filtering
const originalConsoleError = console.error;
console.error = (...args) => {
  // Prevent infinite loops and ignore crash reporter's own errors
  if (
    !this.isReporting &&
    !args[0]?.toString().includes('CrashReporter') &&
    !args[0]?.toString().includes('Failed to save crashes') &&
    !args[0]?.toString().includes('Failed to load crashes')
  ) {
    // Check if this looks like an error
    if (
      args[0] instanceof Error ||
      (typeof args[0] === 'string' && args[0].includes('Error'))
    ) {
      const error = args[0] instanceof Error ? args[0] : new Error(args[0]);
      this.reportCrash(error, 'Console Error');
    }
  }
  originalConsoleError.apply(console, args);
};
```

#### Infinite Loop Prevention

The crash reporter includes comprehensive protection against infinite loops:

- **Reporting State Tracking**: Uses `isReporting` flag to prevent recursive calls
- **Smart Filtering**: Ignores crash reporter's own error messages
- **Safe Error Handling**: Wraps all operations in try-catch blocks
- **Debug Mode Logging**: Temporarily restores original console.error for safe logging

#### Usage

```typescript
import { crashReporter, useCrashReporter, withCrashReporting } from '@/utils/crashReporter';

// Manual crash reporting
crashReporter.reportCrash(
  new Error('Custom error'),
  'User Action',
  {
    screen: 'HomeScreen',
    userId: '123',
    appState: { currentTab: 'home' }
  }
);

// Using React hook
const DebugComponent = () => {
  const {
    crashes,
    stats,
    recentCrashes,
    reportCrash,
    clearCrashes,
    exportCrashes,
    testCrash
  } = useCrashReporter();

  return (
    <View>
      <Text>Total Crashes: {stats.total}</Text>
      <Text>Recent Crashes (24h): {stats.recent}</Text>
      <Text>Most Common: {stats.mostCommon.join(', ')}</Text>
      <Text>Crashes by Screen:</Text>
      {Object.entries(stats.byScreen).map(([screen, count]) => (
        <Text key={screen}>  {screen}: {count}</Text>
      ))}
      <Button title="Test Crash" onPress={testCrash} />
      <Button title="Clear Crashes" onPress={clearCrashes} />
      <Button title="Export Crashes" onPress={() => console.log(exportCrashes())} />
    </View>
  );
};

// Using HOC for automatic crash reporting
const SafeComponent = withCrashReporting(MyComponent, 'MyComponent');

// Automatic error capture examples
// These will be automatically captured:
console.error(new Error('This will be captured'));
console.error('String error: This will also be captured');
throw new Error('Unhandled error - will be captured by ErrorUtils');

// Development testing
if (__DEV__) {
  // Test crash reporting
  crashReporter.testCrash();

  // Get crash statistics
  const stats = crashReporter.getCrashStats();
  console.log('Crash Statistics:', stats);

  // Export crashes for analysis
  const crashData = crashReporter.exportCrashes();
  console.log('All Crashes:', crashData);
}
```

#### Debug vs Production Behavior

- **Debug Mode (`APP_CONFIG.DEBUG = true`)**:
  - Enhanced console logging with crash details
  - Crash statistics updates every 5 seconds
  - Test crash functionality available
  - Detailed error context logging

- **Production Mode (`APP_CONFIG.DEBUG = false`)**:
  - Silent operation with no console output
  - Automatic integration with external crash services
  - Optimized performance with minimal overhead
  - Secure error reporting without sensitive data exposure

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
  appState: any;
}
```

#### Integration with External Services

```typescript
// Example Sentry integration
private async sendCrashReport(crashReport: CrashReport): Promise<void> {
  try {
    // Sentry.captureException(crashReport.error, {
    //   contexts: {
    //     app: crashReport.context,
    //     device: crashReport.deviceInfo,
    //   },
    //   tags: {
    //     screen: crashReport.context.screen,
    //     userId: crashReport.context.userId,
    //   },
    // });
  } catch (error) {
    AppLogger.error('Failed to send crash report', error);
  }
}
```

## Testing Utilities

### Test Helpers

**Location**: `src/utils/test-helpers.tsx`

#### Features

- **Provider Mocking**: Mock all app providers (Theme, Navigation, QueryClient)
- **Store Mocking**: Mock Zustand stores with jest functions
- **Navigation Mocking**: Mock navigation props and route objects
- **API Mocking**: Mock API responses and error scenarios
- **Form Testing**: Utilities for testing form interactions
- **Async Operations**: Helpers for handling async test scenarios
- **Network Mocking**: Mock network connectivity and status
- **Storage Mocking**: Mock AsyncStorage operations
- **Assertion Utilities**: Common assertion helpers for testing

#### Core Mock Objects

```typescript
import {
  mockUser,
  mockAuthStore,
  mockAppStore,
  mockNavigation,
  mockRoute,
  mockNetworkStatus,
  mockAsyncStorage,
} from '@/utils/test-helpers';

// Pre-configured mock data
const user = mockUser; // Complete user object with preferences
const authStore = mockAuthStore; // Mock auth store with jest functions
const appStore = mockAppStore; // Mock app store with settings
```

#### Custom Render Function

```typescript
import { renderWithProviders } from '@/utils/test-helpers';

// Basic render with providers
const { getByText } = renderWithProviders(<MyComponent />);

// Advanced render with options
const { getByText } = renderWithProviders(<MyComponent />, {
  theme: 'dark',                    // Theme selection
  withNavigation: true,             // Include NavigationContainer
  withQueryClient: true,            // Include QueryClientProvider
  initialEntries: ['/home']         // Navigation initial routes
});
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

#### Form Testing Utilities

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

#### Store Testing

```typescript
import { createMockStore } from '@/utils/test-helpers';

// Create mock store with overrides
const mockStore = createMockStore({
  user: mockUser,
  isAuthenticated: true,
  theme: 'dark',
});
```

#### Assertion Helpers

```typescript
import {
  expectToBeVisible,
  expectToHaveText,
  expectToBeDisabled,
  expectToBeEnabled,
} from '@/utils/test-helpers';

// Use assertion helpers
expectToBeVisible(getByTestId('submit-button'));
expectToHaveText(getByTestId('title'), 'Welcome');
expectToBeDisabled(getByTestId('submit-button'));
expectToBeEnabled(getByTestId('cancel-button'));
```

### Test Server

**Location**: `src/utils/test-server.ts`

#### Features

- **Mock Server**: MSW-based mock server
- **API Mocking**: Mock API endpoints
- **Response Simulation**: Simulate various response scenarios
- **Error Simulation**: Test error handling

#### Usage

```typescript
import { testServer } from '@/utils/test-server';

// Start mock server
testServer.listen();

// Mock successful response
testServer.use(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ users: [mockUser] }));
  })
);

// Mock error response
testServer.use(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
  })
);
```

## Debug Screen

### Debug Screen Component

**Location**: `src/screens/debug/DebugScreen.tsx`

#### Features

- **System Information**: Device and app info
- **Store Inspector**: Real-time store state viewing
- **Network Monitor**: API request history
- **Performance Metrics**: App performance data
- **Feature Toggles**: Enable/disable features for testing

#### Navigation

```typescript
// Add to development navigation
import { DebugScreen } from '@/screens/debug/DebugScreen';

// In your navigator
<Stack.Screen
  name="Debug"
  component={DebugScreen}
  options={{ title: 'Debug Tools' }}
/>
```

## Development Workflow

### Hot Reloading

- **Fast Refresh**: Automatic component reloading
- **State Preservation**: Maintain state during reloads
- **Error Recovery**: Automatic error recovery

### Code Quality Tools

#### ESLint Configuration

**Location**: `.eslintrc.js`

- **TypeScript Rules**: Strict TypeScript linting with v7.0.0+ plugin support
- **React Native Rules**: Platform-specific rules
- **Custom Rules**: Project-specific linting rules
- **Enhanced Type Safety**: Includes `@typescript-eslint/no-empty-object-type` and `@typescript-eslint/no-wrapper-object-types`

##### Key ESLint Rules

```javascript
{
  // TypeScript specific rules
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/prefer-const': 'error',
  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-wrapper-object-types': 'error',

  // React Native specific rules
  'react-native/no-unused-styles': 'error',
  'react-native/split-platform-components': 'error',
  'react-native/no-inline-styles': 'warn',
  'react-native/no-color-literals': 'warn',
}
```

#### Prettier Configuration

**Location**: `.prettierrc`

- **Code Formatting**: Consistent code formatting
- **Import Sorting**: Automatic import organization
- **Style Consistency**: Enforced style guidelines

### Pre-commit Hooks

**Location**: `package.json` (husky configuration)

- **Lint Staged**: Run linters on staged files
- **Type Checking**: TypeScript compilation check
- **Test Running**: Run relevant tests
- **Format Checking**: Ensure code formatting

## Environment-Specific Tools

### Development Environment

- **Debug Menu**: Enabled
- **Detailed Logging**: All log levels visible
- **Performance Monitoring**: Enabled
- **State Inspection**: Full access
- **Hot Reloading**: Enabled

### Staging Environment

- **Limited Debugging**: Basic debugging tools
- **Error Reporting**: Enabled
- **Performance Monitoring**: Enabled
- **User Feedback**: Enabled

### Production Environment

- **Debug Tools**: Disabled
- **Error Reporting**: Enabled
- **Performance Monitoring**: Limited
- **Analytics**: Enabled

## Best Practices

### Development Debugging

1. **Use DevMenu**: Quick access to debugging tools
2. **Contextual Logging**: Set appropriate log context
3. **Performance Monitoring**: Monitor critical paths
4. **State Inspection**: Debug state management issues
5. **Network Monitoring**: Track API performance

### Testing Strategy

1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test app performance
5. **Accessibility Tests**: Test accessibility compliance

### Error Handling

1. **Error Boundaries**: Catch and handle errors gracefully
2. **Crash Reporting**: Report crashes with context
3. **User Feedback**: Collect user feedback on errors
4. **Recovery Options**: Provide error recovery mechanisms
5. **Monitoring**: Monitor error rates and patterns

### Performance Optimization

1. **Memory Monitoring**: Track memory usage patterns
2. **Performance Profiling**: Identify bottlenecks
3. **Bundle Analysis**: Optimize bundle size
4. **Lazy Loading**: Load components on demand
5. **Caching**: Implement appropriate caching strategies

## Troubleshooting

### Common Issues

1. **DevMenu Not Showing**
   - Check `APP_CONFIG.DEBUG` is true
   - Verify development environment
   - Clear Metro cache

2. **Logs Not Appearing**
   - Check log level configuration
   - Verify logger initialization
   - Check console filters

3. **Performance Issues**
   - Use performance monitoring tools
   - Check memory usage
   - Profile component renders

4. **State Debugging Issues**
   - Use state inspector
   - Check store subscriptions
   - Verify state persistence

### Debug Commands

```bash
# Clear Metro cache
npx expo start --clear

# Run with debugging
npx expo start --dev-client

# Run tests with debugging
npm test -- --verbose

# Analyze bundle
npx expo export --dump-assetmap

# Check TypeScript
npx tsc --noEmit
```

The development tools in this app provide a comprehensive debugging and development experience, making it easier to build, test, and maintain high-quality React Native applications.
