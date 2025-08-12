import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { ErrorHandler } from '../../utils/errorHandler';
import { NetworkUtils } from '../../utils/network';

interface ApiErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  inline?: boolean;
  context?: 'login' | 'register' | 'form' | 'network' | 'general';
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  showRetryButton = true,
  showDismissButton = true,
  inline = false,
  context = 'general',
}) => {
  const { theme } = useTheme();

  if (!error) {
    return null;
  }

  const isNetworkError = NetworkUtils.isNetworkError(error);
  const errorMessage = ErrorHandler.getContextualError(error, context);

  const getErrorIcon = () => {
    if (isNetworkError) {
      return 'wifi-outline';
    }
    if (error?.status >= 500) {
      return 'server-outline';
    }
    if (error?.status === 401 || error?.status === 403) {
      return 'lock-closed-outline';
    }
    return 'alert-circle-outline';
  };

  const getErrorColor = () => {
    if (isNetworkError) {
      return theme.colors.warning || '#FFA500';
    }
    return theme.colors.error;
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const showAlert = () => {
    const buttons = [];

    if (showDismissButton) {
      buttons.push({
        text: 'OK',
        style: 'cancel' as const,
        onPress: handleDismiss,
      });
    }

    if (showRetryButton && onRetry) {
      buttons.push({ text: 'Retry', onPress: handleRetry });
    }

    Alert.alert(
      isNetworkError ? 'Connection Error' : 'Error',
      errorMessage,
      buttons
    );
  };

  if (!inline) {
    // Show as alert
    React.useEffect(() => {
      showAlert();
    }, [error]);

    return null;
  }

  // Show as inline component
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.errorBackground },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={getErrorIcon()}
          size={20}
          color={getErrorColor()}
          style={styles.icon}
        />

        <Text style={[styles.message, { color: theme.colors.text }]}>
          {errorMessage}
        </Text>
      </View>

      <View style={styles.actions}>
        {showRetryButton && onRetry && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleRetry}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Retry</Text>
          </TouchableOpacity>
        )}

        {showDismissButton && onDismiss && (
          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismiss}
          >
            <Text
              style={[styles.buttonText, { color: theme.colors.textSecondary }]}
            >
              Dismiss
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    borderColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    padding: 16,
  },
  content: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    // backgroundColor set dynamically
  },
});
