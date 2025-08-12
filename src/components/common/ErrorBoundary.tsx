import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorHandler } from '../../utils/errorHandler';
import { NetworkUtils } from '../../utils/network';

interface Props {
  children: ReactNode;
  fallback?: (
    error: Error,
    resetError: () => void,
    errorInfo?: React.ErrorInfo
  ) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  showErrorDetails?: boolean;
  level?: 'screen' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error with context
    ErrorHandler.logError(
      error,
      `ErrorBoundary-${this.props.level || 'component'}`
    );

    // Report to error tracking service in production
    if (!__DEV__) {
      // Here you would integrate with crash reporting service
      // like Sentry, Bugsnag, or Firebase Crashlytics
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.resetError,
          this.state.errorInfo
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
          enableRetry={this.props.enableRetry}
          showErrorDetails={this.props.showErrorDetails}
          level={this.props.level}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  enableRetry?: boolean;
  showErrorDetails?: boolean;
  level?: 'screen' | 'component' | 'global';
  retryCount: number;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  enableRetry = true,
  showErrorDetails = __DEV__,
  level = 'component',
  retryCount,
}) => {
  const isNetworkError = NetworkUtils.isNetworkError(error);
  const maxRetries = 3;
  const canRetry = enableRetry && retryCount < maxRetries;

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
      ? 'The application encountered an unexpected error. We apologize for the inconvenience.'
      : 'This section encountered an error. You can try refreshing or continue using other parts of the app.';
  };

  const getErrorIcon = () => {
    if (isNetworkError) {
      return 'wifi-outline';
    }
    if (level === 'global') {
      return 'alert-circle-outline';
    }
    return 'warning-outline';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Ionicons
          name={getErrorIcon()}
          size={level === 'global' ? 80 : 64}
          color={isNetworkError ? '#FFA500' : '#FF6B6B'}
          style={styles.icon}
        />

        <Text style={[styles.title, level === 'global' && styles.globalTitle]}>
          {getErrorTitle()}
        </Text>

        <Text style={styles.message}>{getErrorMessage()}</Text>

        {retryCount > 0 && (
          <Text style={styles.retryInfo}>
            Retry attempt: {retryCount}/{maxRetries}
          </Text>
        )}

        {showErrorDetails && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>
              Error Details {__DEV__ ? '(Development Mode)' : ''}:
            </Text>
            <Text style={styles.errorText}>{error.message}</Text>

            {error.stack && (
              <ScrollView
                style={styles.stackContainer}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.stackTrace}>{error.stack}</Text>
              </ScrollView>
            )}

            {errorInfo?.componentStack && (
              <View style={styles.componentStack}>
                <Text style={styles.errorTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>
                  {errorInfo.componentStack}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {canRetry && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onReset}
            >
              <Ionicons
                name='refresh-outline'
                size={16}
                color='#FFFFFF'
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                {isNetworkError ? 'Retry Connection' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          )}

          {!canRetry && retryCount >= maxRetries && (
            <Text style={styles.maxRetriesText}>
              Maximum retry attempts reached. Please restart the app or contact
              support.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  componentStack: {
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorDetails: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
    maxHeight: 300,
    padding: 16,
    width: '100%',
  },
  errorText: {
    color: '#666',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  globalTitle: {
    fontSize: 28,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 24,
  },
  maxRetriesText: {
    color: '#FF6B6B',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  message: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  retryInfo: {
    color: '#999',
    fontSize: 14,
    marginBottom: 24,
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
    color: '#999',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
