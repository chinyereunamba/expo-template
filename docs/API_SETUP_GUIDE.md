# API Setup Quick Start Guide

This guide will help you quickly set up the API integration for the Expo Mobile Skeleton project.

## 🚀 Quick Setup (5 minutes)

### 1. Environment Configuration

Create or update your `.env` file:

```bash
# .env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_DEBUG_MODE=true
```

### 2. Update API Configuration

If needed, modify the API client settings in `src/services/apiClient.ts`:

```typescript
const API_CONFIG = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000, // Adjust timeout as needed
  retryAttempts: 3, // Number of retry attempts
  retryDelay: 1000, // Delay between retries
};
```

### 3. Test API Connection

Run the app and check the debug logs:

```bash
npm start
```

Look for API-related logs in the console to verify connectivity.

## 🔧 Backend Requirements

Your backend API must implement these endpoints:

### Authentication Endpoints

```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

### User Endpoints

```
GET /user/profile
PUT /user/profile
POST /user/change-password
POST /user/avatar
DELETE /user/account
```

## 📝 Response Format

All endpoints should return this format:

```json
{
  "data": {
    /* your data here */
  },
  "message": "Success message",
  "success": true,
  "timestamp": "2023-12-01T10:00:00Z"
}
```

## 🔐 Authentication Flow

1. **Login**: `POST /auth/login` returns JWT token
2. **Auto-refresh**: Token automatically refreshes when expired
3. **Logout**: `POST /auth/logout` invalidates session

## 🧪 Testing with Mock Server

The project includes a mock server for development:

```typescript
// Already configured in src/utils/test-server.ts
// Mock endpoints are automatically set up for testing
```

## 📱 Usage in Components

### Login Example

```typescript
import { useLogin } from '@/services/authApi';

const LoginScreen = () => {
  const loginMutation = useLogin();

  const handleLogin = async (email, password) => {
    await loginMutation.mutateAsync({ email, password });
  };

  return (
    <Button
      onPress={() => handleLogin('user@example.com', 'password')}
      title="Login"
    />
  );
};
```

### Profile Example

```typescript
import { useProfile } from '@/services/authApi';

const ProfileScreen = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <Text>Loading...</Text>;

  return <Text>Welcome, {profile?.data.firstName}!</Text>;
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"Network request failed"**
   - Check your API URL in `.env`
   - Verify backend is running
   - Check CORS settings

2. **"401 Unauthorized"**
   - Token might be expired
   - Check JWT implementation
   - Verify refresh token logic

3. **Type errors**
   - Ensure backend responses match TypeScript interfaces
   - Check `src/types/api.ts` for expected formats

### Debug Tips

1. **Enable debug mode** in `.env`:

   ```bash
   EXPO_PUBLIC_DEBUG_MODE=true
   ```

2. **Check network logs** in the app:
   - Go to Debug Screen (if available)
   - View network requests and responses

3. **Use React Query DevTools**:
   ```typescript
   // Already configured in development mode
   // Check the React Query cache state
   ```

## 🔄 Next Steps

1. **Implement your backend** following the API specification
2. **Test all endpoints** using the provided mock server
3. **Customize error handling** in `src/utils/errorHandler.ts`
4. **Add new endpoints** by extending `src/services/authApi.ts`

## 📚 Additional Resources

- [Full API Documentation](./API_ROUTES.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Testing Guide](./TESTING.md)

## 💡 Pro Tips

1. **Use TypeScript interfaces** for all API calls
2. **Leverage React Query hooks** for automatic caching
3. **Handle offline scenarios** with the built-in network monitoring
4. **Test with mock data** before connecting to real backend
5. **Monitor API performance** using the network monitor

---

Need help? Check the full [API Routes Documentation](./API_ROUTES.md) for detailed information.
