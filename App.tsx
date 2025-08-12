import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

/**
 * Main App Component
 *
 * This is the root component of the Expo Mobile Skeleton app.
 * It sets up the global error boundary, providers, and navigation.
 *
 * Features:
 * - Global error boundary for crash handling
 * - Provider setup for theme, auth, and API
 * - Navigation system with authentication flow
 * - Status bar configuration
 */
export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to crash reporting service in production
        if (__DEV__) {
          console.error('App Error Boundary:', error, errorInfo);
        }
        // TODO: Add crash reporting service integration
        // Example: Crashlytics.recordError(error);
      }}
    >
      <AppProviders>
        <AppNavigator />
        <StatusBar style='auto' />
      </AppProviders>
    </ErrorBoundary>
  );
}
