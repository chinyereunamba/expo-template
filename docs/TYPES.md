# Types Documentation

This document covers the comprehensive TypeScript type system used throughout the Expo Mobile Skeleton app.

## Overview

The app uses a robust type system to ensure type safety, better developer experience, and reduced runtime errors. All types are organized by domain and feature area.

## Type Organization

```
src/types/
├── index.ts           # Main type exports
├── api.ts            # API-related types
├── common.ts         # Common utility types
├── navigation.ts     # Navigation parameter types
├── store.ts          # State management types
├── theme.ts          # Theme and styling types
└── user.ts           # User and authentication types
```

## Core Types

### User Types

**Location**: `src/types/user.ts`

#### User Interface

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}
```

#### User Preferences

```typescript
export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
  };
}
```

#### Authentication Types

```typescript
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
```

### Store Types

**Location**: `src/types/store.ts`

#### Auth Store State

```typescript
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAt: string | null;
}
```

#### App Store State

```typescript
export interface AppState {
  theme: ThemeMode;
  isFirstLaunch: boolean;
  notifications: NotificationSettings;
  isOnline: boolean;
  appVersion: string;
  buildNumber: string;
  lastUpdated: string | null;
  settings: AppSettings;
}
```

#### Notification Settings

```typescript
export interface NotificationSettings {
  enabled: boolean;
  token?: string;
  categories: {
    general: boolean;
    security: boolean;
    marketing: boolean;
    updates: boolean;
  };
  schedule: {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
}
```

#### App Settings

```typescript
export interface AppSettings {
  language: string;
  region: string;
  currency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  biometricEnabled: boolean;
  autoLockTimeout: number; // in minutes
  crashReporting: boolean;
  analytics: boolean;
}
```

### API Types

**Location**: `src/types/api.ts`

#### Generic API Response

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}
```

#### API Error Types

```typescript
export interface ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  timestamp: number;
  requestId?: string;
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
}
```

#### Pagination Types

```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    pagination: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}
```

### Navigation Types

**Location**: `src/types/navigation.ts`

#### Root Navigation Types

```typescript
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Debug: undefined;
};
```

#### Stack Navigation Types

```typescript
export type HomeStackParamList = {
  HomeScreen: undefined;
  DetailsScreen: { id: string; title?: string };
  SearchScreen: { query?: string; filters?: SearchFilters };
};

export type AuthStackParamList = {
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { token: string };
  VerifyEmailScreen: { email: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  UserSettingsScreen: undefined;
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  AppSettingsScreen: undefined;
  AboutScreen: undefined;
  HelpScreen: undefined;
  PrivacyScreen: undefined;
};
```

#### Navigation Props Types

```typescript
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;
```

### Theme Types

**Location**: `src/types/theme.ts`

#### Theme Mode

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';
```

#### Theme Interface

```typescript
export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
}
```

#### Theme Colors

```typescript
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;

  // Interactive colors
  link: string;
  linkHover: string;
  disabled: string;
  placeholder: string;
}
```

#### Theme Spacing

```typescript
export interface ThemeSpacing {
  xs: number; // 4
  sm: number; // 8
  md: number; // 16
  lg: number; // 24
  xl: number; // 32
  xxl: number; // 48
}
```

#### Theme Typography

```typescript
export interface ThemeTypography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
  button: TextStyle;
}
```

### Common Types

**Location**: `src/types/common.ts`

#### Generic Utility Types

```typescript
// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

#### Form Types

```typescript
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
}

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};
```

#### Async State Types

```typescript
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: string | null;
}

export interface ListState<T> extends AsyncState<T[]> {
  pagination: PaginationMeta;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

#### Component Props Types

```typescript
export interface BaseComponentProps {
  testID?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}
```

## Type Guards

### User Type Guards

```typescript
export const isUser = (value: any): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string'
  );
};

export const isAuthenticatedUser = (user: User | null): user is User => {
  return user !== null && isUser(user);
};
```

### API Type Guards

```typescript
export const isApiResponse = <T>(value: any): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.success === 'boolean' &&
    'data' in value &&
    typeof value.message === 'string'
  );
};

export const isApiError = (error: any): error is ApiError => {
  return (
    error instanceof Error &&
    typeof error.status === 'number' &&
    typeof error.statusText === 'string'
  );
};
```

### Navigation Type Guards

```typescript
export const isNavigationState = (state: any): state is NavigationState => {
  return (
    typeof state === 'object' &&
    state !== null &&
    Array.isArray(state.routes) &&
    typeof state.index === 'number'
  );
};
```

## Type Utilities

### API Response Helpers

```typescript
// Extract data type from API response
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;

// Create API response type
export const createApiResponse = <T>(
  data: T,
  success: boolean = true,
  message: string = ''
): ApiResponse<T> => ({
  success,
  data,
  message,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9),
  },
});
```

### Form Type Helpers

```typescript
// Extract form field types
export type FormFieldType<T> = T extends FormField<infer U> ? U : never;

// Create form state from data type
export type CreateFormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

// Form validation result
export type ValidationResult<T extends Record<string, any>> = {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
};
```

### Store Type Helpers

```typescript
// Store action types
export type StoreAction<T = any> = {
  type: string;
  payload?: T;
};

// Store selector type
export type StoreSelector<TState, TResult> = (state: TState) => TResult;

// Store subscription type
export type StoreSubscription<TState> = (state: TState) => void;
```

## Best Practices

### Type Definition Guidelines

1. **Explicit Types**: Always define explicit types for public APIs
2. **Generic Types**: Use generics for reusable type definitions
3. **Union Types**: Use union types for controlled value sets
4. **Optional Properties**: Use optional properties judiciously
5. **Type Guards**: Implement type guards for runtime type checking

### Naming Conventions

1. **Interfaces**: Use PascalCase with descriptive names (e.g., `UserProfile`)
2. **Types**: Use PascalCase for type aliases (e.g., `ThemeMode`)
3. **Enums**: Use PascalCase for enum names and UPPER_CASE for values
4. **Generics**: Use single uppercase letters (T, U, V) or descriptive names

### Type Organization

1. **Domain-Based**: Organize types by feature domain
2. **Shared Types**: Place common types in `common.ts`
3. **Export Strategy**: Re-export all types from `index.ts`
4. **Documentation**: Document complex types with JSDoc comments

### Type Safety

1. **Strict Mode**: Enable strict TypeScript compilation
2. **No Any**: Avoid `any` type, use `unknown` instead
3. **Type Assertions**: Use type assertions sparingly and safely
4. **Runtime Validation**: Combine static types with runtime validation

This comprehensive type system ensures type safety throughout the application while maintaining flexibility and developer productivity.
