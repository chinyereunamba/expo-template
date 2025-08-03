# API Integration with Zustand and TanStack Query

This directory contains the API integration layer using Zustand for state management and TanStack Query (React Query) for data fetching, caching, and synchronization.

## Architecture Overview

### State Management (Zustand)

- **authStore.ts**: Authentication state management
- **networkStore.ts**: Network connectivity state management

### API Layer

- **apiClient.ts**: Core HTTP client with retry logic and authentication
- **authApi.ts**: Authentication API endpoints and React Query hooks
- **queryClient.ts**: TanStack Query configuration with offline support

### Providers

- **ApiProvider.tsx**: Main provider component that sets up Query Client and network monitoring

## Key Features

### 1. Authentication Management

```typescript
import { useAuth, useAuthActions } from '../store/authStore';
import { useLogin, useProfile } from '../services/authApi';

const { user, isAuthenticated, isLoading } = useAuth();
const { setCredentials, logout } = useAuthActions();
const loginMutation = useLogin();
```

### 2. Network Monitoring

```typescript
import { useNetwork, useNetworkActions } from '../store/networkStore';

const { isOnline, isOffline, type, isExpensive } = useNetwork();
```

### 3. Offline Support

- Automatic query retry when connection is restored
- Persistent cache using AsyncStorage
- Optimistic updates with rollback on failure
- Network-aware query execution

### 4. Error Handling

```typescript
import { ErrorHandler } from '../utils/errorHandler';

// Format errors for user display
const userMessage = ErrorHandler.formatErrorForUser(error);

// Check if error is retryable
const canRetry = ErrorHandler.isRetryableError(error);
```

### 5. Automatic Token Refresh

The API client automatically handles token refresh:

- Detects 401 responses
- Attempts token refresh
- Retries original request with new token
- Logs out user if refresh fails

## Usage Examples

### Basic Authentication

```typescript
import { useLogin, useRegister, useLogout } from '../services/authApi';

const LoginComponent = () => {
  const loginMutation = useLogin();

  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
  };

  return (
    <button
      onClick={() => handleLogin({ email, password })}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? 'Logging in...' : 'Login'}
    </button>
  );
};
```

### Profile Management

```typescript
import { useProfile, useUpdateProfile } from '../services/authApi';

const ProfileComponent = () => {
  const profileQuery = useProfile();
  const updateMutation = useUpdateProfile();

  if (profileQuery.isLoading) return <Text>Loading...</Text>;
  if (profileQuery.error) return <Text>Error loading profile</Text>;

  return (
    <View>
      <Text>{profileQuery.data?.data.name}</Text>
      <Button
        onPress={() => updateMutation.mutate({ name: 'New Name' })}
        title="Update Profile"
      />
    </View>
  );
};
```

### Network-Aware Components

```typescript
import { useNetwork } from '../store/networkStore';

const NetworkAwareComponent = () => {
  const { isOnline, isOffline, type } = useNetwork();

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Connection: {type}</Text>
      {isOffline && <Text>Some features may be limited</Text>}
    </View>
  );
};
```

## Configuration

### Query Client Setup

The query client is configured with:

- 5-minute stale time for queries
- 10-minute garbage collection time
- Automatic retry with exponential backoff
- Offline-first network mode
- Persistent caching with AsyncStorage

### API Client Configuration

```typescript
const API_CONFIG = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

## Integration with App

1. **Wrap your app with ApiProvider**:

```typescript
import { ApiProvider } from './src/providers/ApiProvider';

export default function App() {
  return (
    <ApiProvider>
      <YourAppContent />
    </ApiProvider>
  );
}
```

2. **Use hooks in components**:

```typescript
import { useAuth } from './src/store/authStore';
import { useLogin } from './src/services/authApi';
```

## Error Handling Strategy

1. **Network Errors**: Automatic retry with exponential backoff
2. **Authentication Errors**: Automatic token refresh, logout on failure
3. **Validation Errors**: Extracted and formatted for form display
4. **Server Errors**: Retry for 5xx errors, user-friendly messages

## Offline Behavior

1. **Queries**: Served from cache when offline
2. **Mutations**: Queued and executed when online
3. **Cache**: Persisted to AsyncStorage
4. **Sync**: Automatic refetch when connection restored

## Testing

The API integration includes comprehensive error handling and logging for development:

- All errors are logged in development mode
- Network status changes are tracked
- Query cache statistics are available
- Retry attempts are monitored

## Performance Considerations

1. **Caching**: Aggressive caching with smart invalidation
2. **Optimistic Updates**: Immediate UI updates with rollback
3. **Background Refetch**: Stale data updated in background
4. **Memory Management**: Automatic garbage collection of unused data
5. **Network Efficiency**: Retry only on retryable errors
