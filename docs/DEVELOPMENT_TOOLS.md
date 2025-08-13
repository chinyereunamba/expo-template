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

**Location**: `src/utils/crashReporter.ts`

#### Features

- **Error Capture**: Automatic error capturing
- **Context Collection**: Gather error context
- **User Feedback**: Collect user feedback on crashes
- **Test Crashes**: Generate test crashes for validation

#### Usage

```typescript
import { crashReporter } from '@/utils/crashReporter';

// Initialize crash reporting
crashReporter.initialize();

// Report custom error
crashReporter.reportError(new Error('Custom error'), {
  screen: 'HomeScreen',
  action: 'button-press',
});

// Test crash reporting
crashReporter.testCrash();

// Set user context
crashReporter.setUserContext({
  userId: '123',
  email: 'user@example.com',
});
```

## Testing Utilities

### Test Helpers

**Location**: `src/utils/test-helpers.tsx`

#### Features

- **Provider Mocking**: Mock all app providers
- **Store Mocking**: Mock Zustand stores
- **Navigation Mocking**: Mock navigation props
- **API Mocking**: Mock API responses

#### Usage

```typescript
import {
  renderWithProviders,
  mockAuthState,
  mockNavigation,
  mockApiResponse
} from '@/utils/test-helpers';

// Render component with all providers
const { getByText } = renderWithProviders(<MyComponent />);

// Mock authentication state
mockAuthState({ user: mockUser, isAuthenticated: true });

// Mock navigation
const navigation = mockNavigation();

// Mock API response
mockApiResponse('/api/users', { users: [mockUser] });
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

- **TypeScript Rules**: Strict TypeScript linting
- **React Native Rules**: Platform-specific rules
- **Custom Rules**: Project-specific linting rules

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
