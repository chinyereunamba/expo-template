# Development and Debugging Tools

This directory contains development and debugging utilities for the Expo Mobile Skeleton app.

## Available Tools

### 1. Logger (`logger.ts`)

Enhanced logging system with context-aware logging and structured output.

**Features:**

- Context-based logging (e.g., `[NetworkMonitor]`, `[AuthStore]`)
- Different log levels (debug, info, warn, error)
- Performance timing utilities
- Memory usage logging
- Automatic crash reporting integration

**Usage:**

```typescript
import { AppLogger, createLogger } from '@/utils/logger';

// Use global logger
AppLogger.setContext('MyComponent').debug('Debug message', data);

// Create component-specific logger
const logger = createLogger('MyComponent');
logger.info('Info message');

// Performance timing
const timer = logger.startTimer('Operation');
// ... do work
timer(); // Logs the duration
```

### 2. Network Monitor (`networkMonitor.ts`)

Monitors all network requests and provides detailed analytics.

**Features:**

- Request/response logging
- Performance metrics (response times, success rates)
- Failed request tracking
- Network statistics
- React hook for UI integration

**Usage:**

```typescript
import { useNetworkMonitor, monitoredFetch } from '@/utils/networkMonitor';

// In components
const { requests, stats, failedRequests } = useNetworkMonitor();

// For API calls (automatically integrated in apiClient)
const response = await monitoredFetch('/api/endpoint');
```

### 3. Zustand DevTools (`zustandDevtools.ts`)

Development tools for Zustand state management.

**Features:**

- State change logging
- State inspection and export
- Store registration and monitoring
- Performance monitoring for state updates

**Usage:**

```typescript
import { devtools, stateInspector } from '@/utils/zustandDevtools';

// Wrap store with devtools
const useMyStore = create(
  devtools(
    set => ({
      // store implementation
    }),
    'MyStore'
  )
);

// Register for inspection
stateInspector.registerStore('MyStore', useMyStore);
```

### 4. Crash Reporter (`crashReporter.ts`)

Comprehensive crash reporting and error tracking.

**Features:**

- Global error handling
- Crash report storage and export
- Error statistics and analysis
- Integration with external crash reporting services
- React error boundary integration

**Usage:**

```typescript
import { crashReporter, useCrashReporter } from '@/utils/crashReporter';

// Manual crash reporting
crashReporter.reportCrash(error, 'Context', additionalData);

// In components
const { crashes, stats, testCrash } = useCrashReporter();

// Wrap components
const SafeComponent = withCrashReporting(MyComponent, 'MyComponent');
```

### 5. Performance Monitor (`usePerformanceMonitor.ts`)

React hook for monitoring component performance.

**Features:**

- Component mount/render time tracking
- Async operation measurement
- Performance metrics collection
- HOC for automatic monitoring

**Usage:**

```typescript
import {
  usePerformanceMonitor,
  withPerformanceMonitoring,
} from '@/hooks/usePerformanceMonitor';

// In components
const { measureAsync, measureSync, logMetrics } =
  usePerformanceMonitor('MyComponent');

// Measure operations
const result = await measureAsync(asyncOperation, 'API Call');
const syncResult = measureSync(syncOperation, 'Calculation');

// HOC usage
const MonitoredComponent = withPerformanceMonitoring(
  MyComponent,
  'MyComponent'
);
```

## Debug Screen

The debug screen (`/src/screens/debug/DebugScreen.tsx`) provides a comprehensive UI for accessing all debugging tools.

**Features:**

- App information display
- Network monitoring dashboard
- State management inspection
- Crash reporting interface
- Performance tools
- Data export/import capabilities

**Access:**

- Only available in development mode
- Accessible via the "Debug" tab in the main navigation
- Or use the floating DevMenu component on any screen

## DevMenu Component

A floating debug menu that can be added to any screen for quick access to debugging tools.

**Usage:**

```typescript
import { DevMenu } from '@/components/common';

const MyScreen = () => {
  return (
    <View>
      {/* Your screen content */}
      <DevMenu screenName="MyScreen" />
    </View>
  );
};
```

## Configuration

All debugging tools respect the `APP_CONFIG.DEBUG` flag and are automatically disabled in production builds.

### Environment Variables

- `EXPO_PUBLIC_DEBUG_MODE=true` - Enables debug mode
- Debug tools are only active when this is set to `true`

## Integration with External Services

The crash reporter is designed to integrate with external services:

- **Sentry**: Uncomment and configure Sentry integration
- **Crashlytics**: Add Firebase Crashlytics configuration
- **Bugsnag**: Add Bugsnag configuration
- **Custom endpoint**: Configure your own crash reporting endpoint

## Best Practices

1. **Use appropriate log levels**: Debug for development, info for important events, warn for potential issues, error for actual problems
2. **Add context**: Always set appropriate context for loggers
3. **Monitor performance**: Use performance monitoring for critical components
4. **Handle errors gracefully**: Use crash reporting for better error tracking
5. **Clean up in production**: All debug tools are automatically disabled in production

## Development Workflow

1. **During development**: Use debug screen and DevMenu for real-time monitoring
2. **Testing**: Export debug data for analysis
3. **Debugging issues**: Use network monitor and crash reports to identify problems
4. **Performance optimization**: Use performance monitoring to identify bottlenecks
5. **Production preparation**: Ensure all debug tools are properly disabled

## Troubleshooting

### Debug tools not working

- Check that `EXPO_PUBLIC_DEBUG_MODE=true` in your environment
- Verify that you're running in development mode
- Check console for any initialization errors

### Performance issues

- Debug tools add overhead in development
- Use performance monitoring to identify actual bottlenecks
- Consider disabling verbose logging for performance-critical operations

### Memory leaks

- Use memory monitoring to track usage
- Ensure proper cleanup of listeners and timers
- Check for retained references in crash reports
