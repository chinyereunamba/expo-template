import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useTheme } from '../hooks/useTheme';
import { ErrorHandler } from '../utils/errorHandler';
import { NetworkUtils } from '../utils/network';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'global' | 'screen' | 'component';
  enableRetry?: boolean;
  showErrorDetails?: boolean;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  onError,
  level = 'global',
  enableRetry = true,
  showErrorDetails = __DEV__,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging and crash reporting
    ErrorHandler.logError(error, `${level} Error Boundary`);

    // Handle network-specific errors
    if (NetworkUtils.isNetworkError(error)) {
      console.warn('Network error in error boundary:', error.message);
    }

    // Report to crash analytics service (if configured)
    if (!__DEV__) {
      // Example integrations:
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
      // Crashlytics.recordError(error);
      // Bugsnag.notify(error, event => { event.addMetadata('react', errorInfo); });
      console.error('Production error reported:', error, errorInfo);
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  const renderFallback = (
    error: Error,
    resetError: () => void,
    errorInfo?: React.ErrorInfo
  ) => (
    <GlobalErrorFallback
      error={error}
      onReset={resetError}
      errorInfo={errorInfo}
      level={level}
      enableRetry={enableRetry}
      showErrorDetails={showErrorDetails}
    />
  );

  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleError}
      level={level}
      enableRetry={enableRetry}
      showErrorDetails={showErrorDetails}
    >
      {children}
    </ErrorBoundary>
  );
};

interface GlobalErrorFallbackProps {
  error: Error;
  onReset: () => void;
  errorInfo?: React.ErrorInfo;
  level?: 'global' | 'screen' | 'component';
  enableRetry?: boolean;
  showErrorDetails?: boolean;
}

const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({
  error,
  onReset,
  errorInfo,
  level = 'global',
  enableRetry = true,
  showErrorDetails = __DEV__,
}) => {
  const { theme } = useTheme();
  const isNetworkError = NetworkUtils.isNetworkError(error);

  const getErrorTitle = () => {
    if (isNetworkError) {
      return 'Connection Problem';
    }
    if (level === 'global') {
      return 'Application Error';
    }
    return 'Something went wrong';
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }

    const contextualMessage = ErrorHandler.formatErrorForUser(error);
    if (contextualMessage !== error.message) {
      return contextualMessage;
    }

    return level === 'global'
      ? "We're sorry, but something unexpected happened. The error has been reported and we're working to fix it."
      : 'This section encountered an error. You can try refreshing or continue using other parts of the app.';
  };

  const getErrorIcon = () => {
    if (isNetworkError) {
      return 'wifi-outline';
    }
    return 'warning-outline';
  };

  const handleRestart = () => {
    // Clear any cached data if needed
    // Example: queryClient.clear();
    onReset();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Ionicons
          name={getErrorIcon()}
          size={level === 'global' ? 80 : 64}
          color={
            isNetworkError
              ? theme.colors.warning || '#FFA500'
              : theme.colors.error
          }
          style={styles.icon}
        />

        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
            level === 'global' && styles.globalTitle,
          ]}
        >
          {getErrorTitle()}
        </Text>

        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {getErrorMessage()}
        </Text>

        {showErrorDetails && (
          <View
            style={[
              styles.errorDetails,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              Error Details {__DEV__ ? '(Development Mode)' : ''}:
            </Text>
            <Text
              style={[styles.errorText, { color: theme.colors.textSecondary }]}
            >
              {error.message}
            </Text>
            {error.stack && (
              <ScrollView
                style={styles.stackContainer}
                showsVerticalScrollIndicator={true}
              >
                <Text
                  style={[
                    styles.stackTrace,
                    { color: theme.colors.textTertiary || '#999' },
                  ]}
                >
                  {error.stack}
                </Text>
              </ScrollView>
            )}
            {errorInfo?.componentStack && (
              <View style={styles.componentStack}>
                <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
                  Component Stack:
                </Text>
                <Text
                  style={[
                    styles.stackTrace,
                    { color: theme.colors.textTertiary || '#999' },
                  ]}
                >
                  {errorInfo.componentStack}
                </Text>
              </View>
            )}
          </View>
        )}

        {enableRetry && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleRestart}
            >
              <Ionicons
                name='refresh-outline'
                size={16}
                color='#FFFFFF'
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {isNetworkError
                  ? 'Retry Connection'
                  : level === 'global'
                    ? 'Restart App'
                    : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Convenience components for different levels
export const GlobalErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundaryProvider
    level='global'
    enableRetry={true}
    showErrorDetails={__DEV__}
  >
    {children}
  </ErrorBoundaryProvider>
);

export const ScreenErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundaryProvider
    level='screen'
    enableRetry={true}
    showErrorDetails={false}
  >
    {children}
  </ErrorBoundaryProvider>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundaryProvider
    level='component'
    enableRetry={true}
    showErrorDetails={false}
  >
    {children}
  </ErrorBoundaryProvider>
);

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    minWidth: 200,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  componentStack: {
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorDetails: {
    borderRadius: 8,
    marginBottom: 32,
    maxHeight: 300,
    padding: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  globalTitle: {
    fontSize: 32,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 32,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
    padding: 20,
  },
  stackContainer: {
    marginBottom: 12,
    maxHeight: 120,
  },
  stackTrace: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
