import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { APP_CONFIG } from '../../constants';
import { ApiResponse, User } from '../../types';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: APP_CONFIG.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as RootState).auth.token;

    // Set content type
    headers.set('Content-Type', 'application/json');

    // Add authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// Base query with re-authentication
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 unauthorized responses
  if (result.error && result.error.status === 401) {
    // Could implement token refresh logic here
    // For now, just logout the user
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

// API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth'],
  endpoints: builder => ({
    // Authentication endpoints
    login: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      { email: string; password: string }
    >({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<
      ApiResponse<{ user: User; token: string }>,
      { name: string; email: string; password: string }
    >({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // User profile endpoints
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: userData => ({
        url: '/user/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Refresh token endpoint
    refreshToken: builder.mutation<ApiResponse<{ token: string }>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
} = apiSlice;
