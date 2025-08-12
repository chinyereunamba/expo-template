import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { ErrorHandler } from '../utils/errorHandler';
import { NetworkUtils } from '../utils/network';
import { useNetworkStore } from '../store';

export interface FormErrorRecoveryOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  maxRetryAttempts?: number;
  retryDelay?: number;
  enableAutoRecovery?: boolean;
  enableOfflineQueue?: boolean;
  onRecoverySuccess?: (data: T) => void;
  onRecoveryFailed?: (error: any, attempts: number) => void;
}

export interface FormErrorRecoveryReturn<T extends FieldValues> {
  // Recovery state
  isRecovering: boolean;
  recoveryAttempts: number;
  lastRecoveryError: any;

  // Recovery methods
  attemptRecovery: (submitFn: (data: T) => Promise<void>) => Promise<boolean>;
  clearRecoveryState: () => void;

  // Auto-recovery controls
  enableAutoRecovery: () => void;
  disableAutoRecovery: () => void;

  // Offline queue
  queueForOfflineSubmission: (
    data: T,
    submitFn: (data: T) => Promise<void>
  ) => void;
  processOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => void;
  offlineQueueSize: number;

  // Error analysis
  analyzeFormErrors: () => {
    hasNetworkErrors: boolean;
    hasValidationErrors: boolean;
    hasServerErrors: boolean;
    errorSummary: string[];
  };

  // Smart retry logic
  shouldRetry: (error: any) => boolean;
  getRetryDelay: (attempt: number) => number;
}

interface OfflineQueueItem<T extends FieldValues> {
  id: string;
  data: T;
  submitFn: (data: T) => Promise<void>;
  timestamp: number;
  attempts: number;
}

export function useFormErrorRecovery<T extends FieldValues>({
  form,
  maxRetryAttempts = 3,
  retryDelay = 1000,
  enableAutoRecovery = false,
  enableOfflineQueue = true,
  onRecoverySuccess,
  onRecoveryFailed,
}: FormErrorRecoveryOptions<T>): FormErrorRecoveryReturn<T> {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [lastRecoveryError, setLastRecoveryError] = useState<any>(null);
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] =
    useState(enableAutoRecovery);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem<T>[]>([]);

  // Smart retry logic
  const shouldRetry = useCallback((error: any): boolean => {
    // Always retry network errors
    if (NetworkUtils.isNetworkError(error)) {
      return true;
    }

    // Retry server errors (5xx)
    if (error?.status >= 500) {
      return true;
    }

    // Retry timeout errors
    if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
      return true;
    }

    // Don't retry client errors (4xx) except for specific cases
    if (error?.status >= 400 && error?.status < 500) {
      // Retry rate limiting (429)
      if (error?.status === 429) {
        return true;
      }
      // Don't retry validation errors, auth errors, etc.
      return false;
    }

    // Default to retry for unknown errors
    return true;
  }, []);

  const getRetryDelay = useCallback(
    (attempt: number): number => {
      // Exponential backoff with jitter
      const baseDelay = retryDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * baseDelay;
      return Math.min(baseDelay + jitter, 30000); // Max 30 seconds
    },
    [retryDelay]
  );

  // Attempt recovery with smart retry logic
  const attemptRecovery = useCallback(
    async (submitFn: (data: T) => Promise<void>): Promise<boolean> => {
      if (isRecovering) {
        return false;
      }

      setIsRecovering(true);
      setLastRecoveryError(null);

      try {
        // Validate form first
        const isValid = await form.trigger();
        if (!isValid) {
          throw new Error('Form validation failed');
        }

        const data = form.getValues();
        let lastError: any;

        // Retry loop
        for (let attempt = 0; attempt < maxRetryAttempts; attempt++) {
          try {
            setRecoveryAttempts(attempt + 1);

            // Check network connectivity before each attempt
            if (!isConnected || isInternetReachable === false) {
              if (enableOfflineQueue) {
                queueForOfflineSubmission(data, submitFn);
                return true;
              }
              throw new Error('No internet connection');
            }

            // Wait before retry (except first attempt)
            if (attempt > 0) {
              const delay = getRetryDelay(attempt - 1);
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Attempt submission
            await submitFn(data);

            // Success!
            setRecoveryAttempts(0);
            setLastRecoveryError(null);
            onRecoverySuccess?.(data);
            return true;
          } catch (error) {
            lastError = error;
            setLastRecoveryError(error);

            // Check if we should continue retrying
            if (!shouldRetry(error)) {
              break;
            }

            // Log retry attempt
            ErrorHandler.logError(
              error,
              `Form recovery attempt ${attempt + 1}/${maxRetryAttempts}`
            );
          }
        }

        // All attempts failed
        onRecoveryFailed?.(lastError, maxRetryAttempts);
        return false;
      } catch (error) {
        setLastRecoveryError(error);
        onRecoveryFailed?.(error, 0);
        return false;
      } finally {
        setIsRecovering(false);
      }
    },
    [
      form,
      isRecovering,
      maxRetryAttempts,
      isConnected,
      isInternetReachable,
      enableOfflineQueue,
      shouldRetry,
      getRetryDelay,
      onRecoverySuccess,
      onRecoveryFailed,
    ]
  );

  // Offline queue management
  const queueForOfflineSubmission = useCallback(
    (data: T, submitFn: (data: T) => Promise<void>) => {
      const queueItem: OfflineQueueItem<T> = {
        id: Date.now().toString(),
        data,
        submitFn,
        timestamp: Date.now(),
        attempts: 0,
      };

      setOfflineQueue(prev => [...prev, queueItem]);

      Alert.alert(
        'Queued for Later',
        "Your form has been saved and will be submitted when you're back online.",
        [{ text: 'OK' }]
      );
    },
    []
  );

  const processOfflineQueue = useCallback(async (): Promise<void> => {
    if (
      offlineQueue.length === 0 ||
      !isConnected ||
      isInternetReachable === false
    ) {
      return;
    }

    const itemsToProcess = [...offlineQueue];
    const successfulItems: string[] = [];

    for (const item of itemsToProcess) {
      try {
        await item.submitFn(item.data);
        successfulItems.push(item.id);
      } catch (error) {
        // Update attempt count
        setOfflineQueue(prev =>
          prev.map(queueItem =>
            queueItem.id === item.id
              ? { ...queueItem, attempts: queueItem.attempts + 1 }
              : queueItem
          )
        );

        ErrorHandler.logError(
          error,
          `Offline queue processing for item ${item.id}`
        );
      }
    }

    // Remove successful items
    if (successfulItems.length > 0) {
      setOfflineQueue(prev =>
        prev.filter(item => !successfulItems.includes(item.id))
      );

      if (successfulItems.length === itemsToProcess.length) {
        Alert.alert(
          'Forms Submitted',
          `Successfully submitted ${successfulItems.length} queued form(s).`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [offlineQueue, isConnected, isInternetReachable]);

  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
  }, []);

  // Auto-recovery when network is restored
  useEffect(() => {
    if (
      autoRecoveryEnabled &&
      isConnected &&
      isInternetReachable &&
      offlineQueue.length > 0
    ) {
      processOfflineQueue();
    }
  }, [
    autoRecoveryEnabled,
    isConnected,
    isInternetReachable,
    offlineQueue.length,
    processOfflineQueue,
  ]);

  // Error analysis
  const analyzeFormErrors = useCallback(() => {
    const errors = form.formState.errors;
    const errorValues = Object.values(errors);

    const hasValidationErrors = errorValues.length > 0;
    const hasNetworkErrors =
      lastRecoveryError && NetworkUtils.isNetworkError(lastRecoveryError);
    const hasServerErrors =
      lastRecoveryError &&
      lastRecoveryError?.status >= 500 &&
      lastRecoveryError?.status < 600;

    const errorSummary: string[] = [];

    if (hasValidationErrors) {
      errorSummary.push(`${errorValues.length} validation error(s)`);
    }

    if (hasNetworkErrors) {
      errorSummary.push('Network connectivity issue');
    }

    if (hasServerErrors) {
      errorSummary.push('Server error');
    }

    return {
      hasNetworkErrors,
      hasValidationErrors,
      hasServerErrors,
      errorSummary,
    };
  }, [form.formState.errors, lastRecoveryError]);

  const clearRecoveryState = useCallback(() => {
    setRecoveryAttempts(0);
    setLastRecoveryError(null);
  }, []);

  const enableAutoRecoveryFn = useCallback(() => {
    setAutoRecoveryEnabled(true);
  }, []);

  const disableAutoRecoveryFn = useCallback(() => {
    setAutoRecoveryEnabled(false);
  }, []);

  return {
    // Recovery state
    isRecovering,
    recoveryAttempts,
    lastRecoveryError,

    // Recovery methods
    attemptRecovery,
    clearRecoveryState,

    // Auto-recovery controls
    enableAutoRecovery: enableAutoRecoveryFn,
    disableAutoRecovery: disableAutoRecoveryFn,

    // Offline queue
    queueForOfflineSubmission,
    processOfflineQueue,
    clearOfflineQueue,
    offlineQueueSize: offlineQueue.length,

    // Error analysis
    analyzeFormErrors,

    // Smart retry logic
    shouldRetry,
    getRetryDelay,
  };
}
