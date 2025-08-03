import { ApiError } from '@/types';

// Error handling utilities
export const ErrorHandler = {
  // Parse API error response
  parseApiError: (error: ApiError | any): string => {
    if (error?.data?.message) {
      return error.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  },

  // Handle network errors
  handleNetworkError: (error: any): string => {
    if (error?.status === 'FETCH_ERROR') {
      return 'Network error. Please check your connection.';
    }

    if (error?.status === 'TIMEOUT_ERROR') {
      return 'Request timeout. Please try again.';
    }

    return ErrorHandler.parseApiError(error);
  },

  // Log error for debugging
  logError: (error: ApiError | any, context?: string) => {
    if (__DEV__) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }
  },

  // Check if error is an API error
  isApiError: (error: any): error is ApiError => {
    return (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'code' in error
    );
  },

  // Format error for user display
  formatErrorForUser: (error: ApiError | any): string => {
    if (ErrorHandler.isApiError(error)) {
      return error.message;
    }
    return ErrorHandler.parseApiError(error);
  },
};
