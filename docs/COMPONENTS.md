# Components Documentation

This document provides comprehensive documentation for all components in the Expo Mobile Skeleton app.

## Overview

The component library is organized into several categories:

- **Common Components**: Reusable UI components
- **Form Components**: Form-specific components with validation
- **Navigation Components**: Navigation-related components
- **Screen Components**: Full-screen components
- **Provider Components**: Context and state providers

## Common Components

### Button

A themed button component with multiple variants and accessibility support.

**Location**: `src/components/common/Button.tsx`

**Props**:

- `title: string` - Button text
- `onPress: () => void` - Press handler
- `variant?: 'primary' | 'secondary' | 'outline'` - Button style variant
- `size?: 'small' | 'medium' | 'large'` - Button size
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state with spinner
- `icon?: string` - Optional icon name
- `accessibilityLabel?: string` - Accessibility label

**Usage**:

```typescript
<Button
  title="Login"
  onPress={handleLogin}
  variant="primary"
  loading={isLoading}
  accessibilityLabel="Login button"
/>
```

### Card

A flexible card component with theme support and multiple variants.

**Location**: `src/components/common/Card.tsx`

**Props**:

- `children: React.ReactNode` - Card content
- `variant?: 'default' | 'elevated' | 'outlined'` - Card style variant
- `padding?: number` - Custom padding
- `onPress?: () => void` - Optional press handler for interactive cards
- `style?: ViewStyle` - Additional styles

**Usage**:

```typescript
<Card variant="elevated" onPress={handleCardPress}>
  <Text>Card content</Text>
</Card>
```

### Input

A themed input component with validation support.

**Location**: `src/components/common/Input.tsx`

**Props**:

- `value: string` - Input value
- `onChangeText: (text: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `label?: string` - Input label
- `error?: string` - Error message
- `secureTextEntry?: boolean` - Password input
- `keyboardType?: KeyboardTypeOptions` - Keyboard type
- `autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'`
- `disabled?: boolean` - Disabled state

**Usage**:

```typescript
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
  error={emailError}
/>
```

### Loading

A comprehensive loading component with multiple display modes.

**Location**: `src/components/common/Loading.tsx`

**Props**:

- `type?: 'spinner' | 'skeleton' | 'overlay'` - Loading type
- `size?: 'small' | 'medium' | 'large'` - Loading size
- `text?: string` - Loading text
- `overlay?: boolean` - Show as overlay
- `skeletonLines?: number` - Number of skeleton lines

**Usage**:

```typescript
<Loading type="overlay" text="Loading..." />
<Loading type="skeleton" skeletonLines={3} />
```

### Screen

A base screen wrapper component with theme support and safe area handling.

**Location**: `src/components/common/Screen.tsx`

**Props**:

- `children: React.ReactNode` - Screen content
- `scrollable?: boolean` - Enable scrolling
- `padding?: boolean` - Apply default padding
- `backgroundColor?: string` - Custom background color
- `statusBarStyle?: 'light' | 'dark' | 'auto'` - Status bar style

**Usage**:

```typescript
<Screen scrollable padding>
  <Text>Screen content</Text>
</Screen>
```

### DevMenu

A development-only debugging menu with comprehensive development tools.

**Location**: `src/components/common/DevMenu.tsx`

**Props**:

- `screenName?: string` - Current screen name for context

**Features**:

- **Screen View Logging**: Log screen view events
- **Crash Testing**: Generate test crash reports
- **Network Monitoring**: Clear network logs and monitor requests
- **State Inspection**: Export and inspect app state
- **Memory Monitoring**: Check memory usage and performance

**Usage**:

```typescript
// Only renders in development mode
<DevMenu screenName="HomeScreen" />
```

**Development Tools**:

- Floating debug button (🐛) in bottom-right corner
- Modal interface with debug actions
- Integration with logging, crash reporting, and monitoring utilities
- Automatic hiding in production builds

### NetworkStatusIndicator

A component that displays the current network connectivity status.

**Location**: `src/components/common/NetworkStatusIndicator.tsx`

**Features**:

- Real-time network status updates
- Visual indicators for online/offline states
- Connection type display (WiFi, Cellular, etc.)
- Theme-aware styling

### OptimizedImage

An optimized image component with caching and performance features.

**Location**: `src/components/common/OptimizedImage.tsx`

**Props**:

- `source: ImageSourcePropType` - Image source
- `style?: ImageStyle` - Image styles
- `placeholder?: React.ReactNode` - Loading placeholder
- `fallback?: React.ReactNode` - Error fallback
- `cachePolicy?: 'memory' | 'disk' | 'none'` - Caching strategy

### TabBarIcon

A themed tab bar icon component for navigation.

**Location**: `src/components/common/TabBarIcon.tsx`

**Props**:

- `name: string` - Icon name
- `focused: boolean` - Tab focus state
- `color?: string` - Icon color
- `size?: number` - Icon size

## Form Components

### FormInput

An enhanced form input with integrated validation and error handling.

**Location**: `src/components/forms/FormInput.tsx`

**Props**:

- Extends all `Input` props
- `name: string` - Field name for form integration
- `rules?: ValidationRules` - Validation rules
- `control?: Control` - React Hook Form control

**Usage**:

```typescript
<FormInput
  name="email"
  label="Email Address"
  control={control}
  rules={{ required: 'Email is required' }}
  keyboardType="email-address"
/>
```

### ValidationFeedback

A component for displaying real-time validation feedback.

**Location**: `src/components/forms/ValidationFeedback.tsx`

**Props**:

- `error?: string` - Error message
- `success?: string` - Success message
- `warning?: string` - Warning message
- `type?: 'error' | 'success' | 'warning'` - Feedback type

### FormFieldError

A specialized component for displaying form field errors.

**Location**: `src/components/forms/FormFieldError.tsx`

**Props**:

- `error?: string` - Error message
- `visible?: boolean` - Visibility control
- `animated?: boolean` - Animated appearance

## Provider Components

### AppProviders

The root provider component that wraps all other providers.

**Location**: `src/providers/AppProviders.tsx`

**Features**:

- Theme provider integration
- Error boundary provider
- API provider setup
- Navigation container

### ThemeProvider

Provides theme context and utilities throughout the app.

**Location**: `src/theme/ThemeProvider.tsx`

**Context Values**:

- `theme: Theme` - Current theme object
- `isDark: boolean` - Dark mode state
- `toggleTheme: () => void` - Theme toggle function
- `setTheme: (theme: 'light' | 'dark' | 'system') => void` - Set specific theme

### ErrorBoundaryProvider

Provides global error handling and recovery.

**Location**: `src/providers/ErrorBoundaryProvider.tsx`

**Features**:

- Catches JavaScript errors in component tree
- Displays user-friendly error messages
- Provides error recovery options
- Integrates with crash reporting

## Component Testing

### Test Utilities

**Location**: `src/utils/test-helpers.tsx`

**Functions**:

- `renderWithProviders()` - Render components with all providers
- `mockAuthState()` - Mock authentication state
- `mockTheme()` - Mock theme context
- `createMockNavigation()` - Mock navigation props

### Example Test

```typescript
import { renderWithProviders } from '@/utils/test-helpers';
import { Button } from '@/components/common/Button';

test('renders button with title', () => {
  const { getByText } = renderWithProviders(
    <Button title="Test Button" onPress={() => {}} />
  );

  expect(getByText('Test Button')).toBeTruthy();
});
```

## Styling Guidelines

### Theme Usage

All components should use the theme system:

```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
});
```

### Responsive Design

Use responsive utilities for different screen sizes:

```typescript
const { getValue, isSmall } = useResponsive();

const styles = StyleSheet.create({
  container: {
    padding: getValue({ small: 16, medium: 24, large: 32 }),
    flexDirection: isSmall ? 'column' : 'row',
  },
});
```

## Accessibility

### Guidelines

- Use semantic HTML elements and ARIA labels
- Provide meaningful accessibility labels
- Ensure sufficient color contrast
- Support screen readers
- Implement proper focus management

### Example

```typescript
<Button
  title="Submit"
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the current form data"
  accessibilityRole="button"
/>
```

## Performance Considerations

### Optimization Strategies

- Use `React.memo()` for expensive components
- Implement lazy loading for heavy components
- Use `useMemo()` and `useCallback()` appropriately
- Optimize image loading and caching
- Minimize re-renders with proper state management

### Example

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return processData(data);
  }, [data]);

  return <View>{/* Render processed data */}</View>;
});
```

## Best Practices

### Component Structure

1. **Props Interface**: Define clear TypeScript interfaces
2. **Default Props**: Use default parameters or defaultProps
3. **Error Handling**: Implement proper error boundaries
4. **Testing**: Write comprehensive unit tests
5. **Documentation**: Document complex components

### Code Organization

1. **File Naming**: Use PascalCase for component files
2. **Directory Structure**: Group related components
3. **Index Files**: Use index.ts for clean imports
4. **Type Definitions**: Keep types close to components

### Development Workflow

1. **Component First**: Build components in isolation
2. **Storybook**: Use Storybook for component development
3. **Testing**: Test components before integration
4. **Documentation**: Update docs with new components
5. **Review**: Code review for consistency and quality
