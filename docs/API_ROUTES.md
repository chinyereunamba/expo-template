# API Routes Documentation

This document provides a comprehensive guide to setting up and using the API routes in the Expo Mobile Skeleton project.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Backend Setup Guide](#backend-setup-guide)

## Overview

The project uses a RESTful API architecture with the following key features:

- **JWT-based authentication** with automatic token refresh
- **Standardized response format** for all endpoints
- **Automatic retry logic** for failed requests
- **Network monitoring** and offline support
- **Type-safe API client** with TypeScript
- **React Query integration** for caching and state management

## Configuration

### Environment Setup

1. **Configure API Base URL** in your environment:

```typescript
// src/config/environment.ts
export const config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  // ... other config
};
```

2. **Set environment variables** in your `.env` file:

```bash
# .env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
EXPO_PUBLIC_API_VERSION=v1
```

### API Client Configuration

The API client is configured in `src/services/apiClient.ts`:

```typescript
const API_CONFIG = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000, // 10 seconds
  retryAttempts: 3, // Retry failed requests 3 times
  retryDelay: 1000, // 1 second delay between retries
};
```

## Authentication Routes

### POST /auth/login

**Purpose**: Authenticate user and receive JWT tokens

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response**:

```typescript
{
  data: {
    user: User;
    token: string;
    refreshToken: string;
  }
  message: string;
  success: boolean;
  timestamp: string;
}
```

**Usage**:

```typescript
import { useLogin } from '@/services/authApi';

const LoginScreen = () => {
  const loginMutation = useLogin();

  const handleLogin = async credentials => {
    try {
      await loginMutation.mutateAsync(credentials);
      // User is automatically logged in and redirected
    } catch (error) {
      // Error is handled automatically by the hook
    }
  };
};
```

### POST /auth/register

**Purpose**: Create new user account

**Request Body**:

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}
```

**Response**: Same as login response

**Usage**:

```typescript
import { useRegister } from '@/services/authApi';

const RegisterScreen = () => {
  const registerMutation = useRegister();

  const handleRegister = async userData => {
    await registerMutation.mutateAsync(userData);
  };
};
```

### POST /auth/refresh

**Purpose**: Refresh expired JWT token

**Request**: Automatically handled by the API client

**Response**:

```typescript
{
  data: {
    token: string;
    refreshToken: string;
  }
  message: string;
  success: boolean;
  timestamp: string;
}
```

### POST /auth/logout

**Purpose**: Invalidate user session

**Request**: No body required (uses Authorization header)

**Response**:

```typescript
{
  data: null;
  message: 'Logged out successfully';
  success: boolean;
  timestamp: string;
}
```

### POST /auth/forgot-password

**Purpose**: Send password reset email

**Request Body**:

```typescript
{
  email: string;
}
```

**Response**:

```typescript
{
  data: null;
  message: 'Password reset email sent';
  success: boolean;
  timestamp: string;
}
```

### POST /auth/reset-password

**Purpose**: Reset password using token from email

**Request Body**:

```typescript
{
  token: string;
  password: string;
}
```

**Response**:

```typescript
{
  data: null;
  message: 'Password reset successfully';
  success: boolean;
  timestamp: string;
}
```

## User Routes

### GET /user/profile

**Purpose**: Get current user profile

**Request**: No body (uses Authorization header)

**Response**:

```typescript
{
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  success: boolean;
  timestamp: string;
}
```

**Usage**:

```typescript
import { useProfile } from '@/services/authApi';

const ProfileScreen = () => {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ProfileView user={profile.data} />;
};
```

### PUT /user/profile

**Purpose**: Update user profile

**Request Body**:

```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  // ... other updatable fields
}
```

**Response**: Same as GET /user/profile

**Usage**:

```typescript
import { useUpdateProfile } from '@/services/authApi';

const EditProfileScreen = () => {
  const updateProfileMutation = useUpdateProfile();

  const handleUpdate = async updates => {
    await updateProfileMutation.mutateAsync(updates);
  };
};
```

### POST /user/change-password

**Purpose**: Change user password

**Request Body**:

```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response**:

```typescript
{
  data: null;
  message: 'Password changed successfully';
  success: boolean;
  timestamp: string;
}
```

### POST /user/avatar

**Purpose**: Upload user avatar image

**Request**: FormData with image file

**Response**:

```typescript
{
  data: {
    avatarUrl: string;
  }
  message: string;
  success: boolean;
  timestamp: string;
}
```

**Usage**:

```typescript
import { useUploadAvatar } from '@/services/authApi';

const AvatarUpload = () => {
  const uploadAvatarMutation = useUploadAvatar();

  const handleUpload = async imageUri => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    await uploadAvatarMutation.mutateAsync(formData);
  };
};
```

### DELETE /user/account

**Purpose**: Delete user account

**Request Body**:

```typescript
{
  password: string;
}
```

**Response**:

```typescript
{
  data: null;
  message: 'Account deleted successfully';
  success: boolean;
  timestamp: string;
}
```

## Request/Response Format

### Standard Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  data: T; // The actual response data
  message: string; // Human-readable message
  success: boolean; // Whether the request was successful
  timestamp: string; // ISO timestamp of the response
  requestId?: string; // Optional request tracking ID
}
```

### Error Response Format

Error responses follow this structure:

```typescript
interface ApiError {
  message: string; // Error description
  code: string; // Error code (e.g., 'VALIDATION_ERROR')
  statusCode: number; // HTTP status code
  details?: Record<string, any>; // Additional error details
  timestamp: string; // ISO timestamp
  path?: string; // API endpoint that failed
  requestId?: string; // Request tracking ID
}
```

### Headers

All requests include these headers:

```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer <jwt-token>', // When authenticated
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning          | Action                        |
| ---- | ---------------- | ----------------------------- |
| 200  | Success          | Continue normally             |
| 201  | Created          | Resource created successfully |
| 400  | Bad Request      | Check request format          |
| 401  | Unauthorized     | Token refresh or re-login     |
| 403  | Forbidden        | Insufficient permissions      |
| 404  | Not Found        | Resource doesn't exist        |
| 409  | Conflict         | Resource already exists       |
| 422  | Validation Error | Fix validation issues         |
| 429  | Rate Limited     | Retry after delay             |
| 500  | Server Error     | Retry or contact support      |

### Automatic Error Handling

The API client automatically handles:

- **Token refresh** on 401 errors
- **Retry logic** for network failures
- **Network connectivity** checks
- **User-friendly error messages**

### Custom Error Handling

```typescript
import { ErrorHandler } from '@/utils/errorHandler';

try {
  await apiClient.post('/some-endpoint', data);
} catch (error) {
  const userMessage = ErrorHandler.formatErrorForUser(error);
  Alert.alert('Error', userMessage);
}
```

## Usage Examples

### Basic API Call

```typescript
import { apiClient } from '@/services/apiClient';

// GET request
const response = await apiClient.get('/user/profile');

// POST request
const response = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
```

### Using React Query Hooks

```typescript
import { useProfile, useUpdateProfile } from '@/services/authApi';

const ProfileComponent = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleUpdate = async (newData) => {
    await updateProfile.mutateAsync(newData);
  };

  return (
    <View>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ProfileForm
          user={profile.data}
          onUpdate={handleUpdate}
        />
      )}
    </View>
  );
};
```

### File Upload

```typescript
import { useUploadAvatar } from '@/services/authApi';

const uploadImage = async (imageUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as any);

  const uploadMutation = useUploadAvatar();
  await uploadMutation.mutateAsync(formData);
};
```

## Testing

### Mock Server Setup

The project includes a mock server for testing:

```typescript
import { setupMockEndpoints } from '@/utils/test-server';

// In your tests
beforeAll(() => {
  setupMockEndpoints();
});
```

### API Testing

```typescript
import { apiClient } from '@/services/apiClient';

describe('Auth API', () => {
  it('should login successfully', async () => {
    const response = await apiClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data.token).toBeDefined();
  });
});
```

## Backend Setup Guide

### Required Endpoints

Your backend API should implement these endpoints:

#### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

#### User Endpoints

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/change-password` - Change password
- `POST /user/avatar` - Upload avatar
- `DELETE /user/account` - Delete account

### Response Format

Ensure your backend returns responses in this format:

```json
{
  "data": {
    /* actual response data */
  },
  "message": "Success message",
  "success": true,
  "timestamp": "2023-12-01T10:00:00Z",
  "requestId": "req_123456"
}
```

### Error Format

Error responses should follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "details": {
    /* additional error info */
  },
  "timestamp": "2023-12-01T10:00:00Z",
  "path": "/api/endpoint",
  "requestId": "req_123456"
}
```

### JWT Token Structure

JWT tokens should include:

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1638360000,
  "exp": 1638363600,
  "type": "access"
}
```

### CORS Configuration

Configure CORS to allow requests from your mobile app:

```javascript
// Express.js example
app.use(
  cors({
    origin: ['http://localhost:19006'], // Expo web
    credentials: true,
  })
);
```

### Rate Limiting

Implement rate limiting for security:

```javascript
// Express.js example
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts',
});

app.use('/auth/login', authLimiter);
```

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate all inputs** on the backend
3. **Implement rate limiting** for auth endpoints
4. **Use secure JWT secrets** and rotate them regularly
5. **Sanitize error messages** to avoid information leakage
6. **Implement proper CORS** policies
7. **Log security events** for monitoring

## Troubleshooting

### Common Issues

1. **Network timeout errors**
   - Check API_CONFIG.timeout setting
   - Verify network connectivity
   - Check server response times

2. **Authentication failures**
   - Verify JWT token format
   - Check token expiration
   - Ensure refresh token is valid

3. **CORS errors** (web only)
   - Configure backend CORS settings
   - Check allowed origins

4. **Type errors**
   - Ensure API responses match TypeScript interfaces
   - Update type definitions as needed

### Debug Mode

Enable debug logging:

```typescript
// In development
if (__DEV__) {
  console.log('API Request:', config);
  console.log('API Response:', response);
}
```

This documentation should help you set up and use the API routes effectively in your Expo Mobile Skeleton project.
