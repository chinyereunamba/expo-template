import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to crash reporting service in production
        if (__DEV__) {
          console.error('App Error Boundary:', error, errorInfo);
        }
      }}
    >
      <AppProviders>
        <AppNavigator />
        <StatusBar style='auto' />
      </AppProviders>
    </ErrorBoundary>
  );
}
