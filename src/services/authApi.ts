import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { useAuthStore } from '../stores';
import {
  ApiResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types';
import { ErrorHandler } from '../utils/errorHandler';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  user: (id: string) => [...authKeys.all, 'user', id] as const,
};

// Auth API service
export const authApi = {
  // Login
  login: async (
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // Register
  register: async (
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<
    ApiResponse<{ token: string; refreshToken: string }>
  > => {
    const response =
      await apiClient.post<
        ApiResponse<{ token: string; refreshToken: string }>
      >('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  // Get profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (
    userData: Partial<User>
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      '/user/profile',
      userData
    );
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/user/change-password',
      passwordData
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (
    formData: FormData
  ): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const response = await apiClient.upload<ApiResponse<{ avatarUrl: string }>>(
      '/user/avatar',
      formData
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      '/user/account',
      { body: { password } }
    );
    return response.data;
  },
};

// React Query hooks
export const useLogin = () => {
  const { loginSuccess, setError, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: data => {
      loginSuccess({
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken,
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = ErrorHandler.formatErrorForUser(error);
      setError(errorMessage);
      setLoading(false);
      ErrorHandler.logError(error, 'login');
    },
  });
};

export const useRegister = () => {
  const { loginSuccess, setError, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: data => {
      loginSuccess({
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken,
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = ErrorHandler.formatErrorForUser(error);
      setError(errorMessage);
      setLoading(false);
      ErrorHandler.logError(error, 'register');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      // Start cleanup immediately
      logout();
      queryClient.clear();
    },
    onError: (error: any) => {
      // Log error but don't revert logout
      ErrorHandler.logError(error, 'logout');
    },
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateProfile = () => {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onMutate: async newData => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.profile() });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(authKeys.profile());

      // Optimistically update
      queryClient.setQueryData(authKeys.profile(), (old: any) => {
        if (old?.data) {
          return {
            ...old,
            data: { ...old.data, ...newData },
          };
        }
        return old;
      });

      // Update auth store
      updateUser(newData);

      return { previousProfile };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(authKeys.profile(), context.previousProfile);
      }
      ErrorHandler.logError(error, 'updateProfile');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onError: (error: any) => {
      ErrorHandler.logError(error, 'changePassword');
    },
  });
};

export const useUploadAvatar = () => {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: data => {
      // Update user avatar in store
      updateUser({ avatar: data.data.avatarUrl });

      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
    onError: (error: any) => {
      ErrorHandler.logError(error, 'uploadAvatar');
    },
  });
};

export const useDeleteAccount = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: (error: any) => {
      ErrorHandler.logError(error, 'deleteAccount');
    },
  });
};
