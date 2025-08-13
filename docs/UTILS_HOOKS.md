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

### Testing Utilities

**Location**: `src/utils/test-helpers.tsx`

Comprehensive testing utilities for component and integration testing.

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
