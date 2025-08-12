import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { ThemeProvider } from '../theme/ThemeProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * App Providers Component
 *
 * Sets up all the global providers for the application in the correct order:
 * 1. ErrorBoundaryProvider - Global error handling
 * 2. QueryClientProvider - React Query for API state management
 * 3. ThemeProvider - Theme and styling system
 * 4. AuthProvider - Authentication state and context
 *
 * The order is important as inner providers may depend on outer ones.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to crash reporting service
    console.error('Global error caught:', error, errorInfo);

    // TODO: Integrate with crash reporting service
    // Example: Crashlytics.recordError(error);
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundaryProvider onError={handleGlobalError}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  );
};
