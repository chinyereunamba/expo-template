import { ApiError } from '@/types';

// User-friendly error messages mapping
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',

  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',

  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',

  // Form errors
  FORM_SUBMISSION_ERROR:
    'Failed to submit form. Please check your input and try again.',

  // API specific errors
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
};

export const ErrorHandler = {
  // Parse API error response
  parseApiError: (error: any): string => {
    if (error?.data?.message) {
      return error.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    // Handle specific error codes
    if (error?.status) {
      switch (error.status) {
        case 400:
          return ERROR_MESSAGES.VALIDATION_ERROR;
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.USER_NOT_FOUND;
        case 409:
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        case 422:
          return ERROR_MESSAGES.VALIDATION_ERROR;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  // Handle network errors
  handleNetworkError: (error: any): string => {
    if (error?.status === 'FETCH_ERROR') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (error?.status === 'TIMEOUT_ERROR') {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }

    if (error?.name === 'NetworkError') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    return ErrorHandler.parseApiError(error);
  },

  // Handle form validation errors
  handleFormError: (error: any): string => {
    if (error?.data?.errors) {
      // Handle validation errors from server
      const errors = error.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError)) {
        return firstError[0] as string;
      }
      return firstError as string;
    }

    return (
      ErrorHandler.parseApiError(error) || ERROR_MESSAGES.FORM_SUBMISSION_ERROR
    );
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

  // Check if error is a network error
  isNetworkError: (error: any): boolean => {
    return (
      error?.status === 'FETCH_ERROR' ||
      error?.name === 'NetworkError' ||
      error?.code === 'NETWORK_ERROR' ||
      !navigator.onLine
    );
  },

  // Format error for user display
  formatErrorForUser: (error: ApiError | any): string => {
    if (ErrorHandler.isNetworkError(error)) {
      return ErrorHandler.handleNetworkError(error);
    }

    if (ErrorHandler.isApiError(error)) {
      return error.message;
    }

    return ErrorHandler.parseApiError(error);
  },

  // Create user-friendly error message based on context
  getContextualError: (
    error: any,
    context: 'login' | 'register' | 'form' | 'network' | 'general' = 'general'
  ): string => {
    switch (context) {
      case 'login':
        if (error?.status === 401) {
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        }
        break;
      case 'register':
        if (error?.status === 409) {
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        }
        if (error?.data?.message?.includes('password')) {
          return ERROR_MESSAGES.WEAK_PASSWORD;
        }
        break;
      case 'form':
        return ErrorHandler.handleFormError(error);
      case 'network':
        return ErrorHandler.handleNetworkError(error);
    }

    return ErrorHandler.formatErrorForUser(error);
  },
};
