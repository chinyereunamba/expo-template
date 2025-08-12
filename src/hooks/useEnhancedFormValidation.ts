import { useCallback, useEffect, useState } from 'react';
import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';
import { Alert } from 'react-native';
import { ErrorHandler } from '../utils/errorHandler';
import { NetworkUtils } from '../utils/network';
import { useNetworkStore } from '../store';
import { useNetworkMonitor } from './useNetworkMonitor';

export interface UseEnhancedFormValidationOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, 'resolver'> {
  schema: ObjectSchema<T>;
  onSubmit?: (data: T) => void | Promise<void>;
  onError?: (error: any) => void;
  onSuccess?: (data: T) => void;
  enableNetworkValidation?: boolean;
  showNetworkErrors?: boolean;
  enableRealTimeValidation?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface EnhancedFormValidationReturn<T extends FieldValues>
  extends UseFormReturn<T> {
  // Enhanced submit handlers
  handleSubmitWithErrorHandling: (
    onValid: (data: T) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;

  handleSubmitWithRetry: (
    onValid: (data: T) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;

  // Field helpers with enhanced validation
  getFieldProps: (name: Path<T>) => {
    value: any;
    error: string | undefined;
    onChangeText: (value: string) => void;
    onBlur: () => void;
    hasError: boolean;
    isTouched: boolean;
    isDirty: boolean;
  };

  // Error management
  getFieldError: (name: Path<T>) => string | undefined;
  hasFieldError: (name: Path<T>) => boolean;
  setFieldError: (name: Path<T>, error: string) => void;
  clearFieldError: (name: Path<T>) => void;
  clearAllErrors: () => void;

  // Server error handling
  handleServerErrors: (errors: Record<string, string | string[]>) => void;

  // Network status
  isOffline: boolean;
  isOnline: boolean;

  // Enhanced state
  isSubmittingWithRetry: boolean;
  submitAttempts: number;
  lastSubmitError: any;

  // Validation helpers
  validateField: (name: Path<T>) => Promise<boolean>;
  validateAllFields: () => Promise<boolean>;

  // Form state helpers
  hasErrors: boolean;
  hasChanges: boolean;
  canSubmit: boolean;
}

export function useEnhancedFormValidation<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  onSuccess,
  enableNetworkValidation = true,
  showNetworkErrors = true,
  enableRealTimeValidation = true,
  retryAttempts = 2,
  retryDelay = 1000,
  ...options
}: UseEnhancedFormValidationOptions<T>): EnhancedFormValidationReturn<T> {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitError, setLastSubmitError] = useState<any>(null);
  const [isSubmittingWithRetry, setIsSubmittingWithRetry] = useState(false);

  // Initialize network monitoring
  useNetworkMonitor();

  const form = useReactHookForm<T>({
    resolver: yupResolver(schema),
    mode: enableRealTimeValidation ? 'onChange' : 'onSubmit',
    reValidateMode: 'onChange',
    ...options,
  });

  // Enhanced field props with comprehensive validation info
  const getFieldProps = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      const value = form.watch(name);

      return {
        value: value || '',
        error: fieldState.error?.message,
        hasError: !!fieldState.error,
        isTouched: fieldState.isTouched,
        isDirty: fieldState.isDirty,
        onChangeText: (value: string) => {
          form.setValue(name, value as any, {
            shouldValidate: enableRealTimeValidation,
            shouldDirty: true,
            shouldTouch: true,
          });
        },
        onBlur: () => {
          form.trigger(name);
        },
      };
    },
    [form, enableRealTimeValidation]
  );

  // Error management helpers
  const getFieldError = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      return fieldState.error?.message;
    },
    [form]
  );

  const hasFieldError = useCallback(
    (name: Path<T>) => {
      const fieldState = form.getFieldState(name);
      return !!fieldState.error;
    },
    [form]
  );

  const setFieldError = useCallback(
    (name: Path<T>, error: string) => {
      form.setError(name, { message: error });
    },
    [form]
  );

  const clearFieldError = useCallback(
    (name: Path<T>) => {
      form.clearErrors(name);
    },
    [form]
  );

  const clearAllErrors = useCallback(() => {
    form.clearErrors();
    setLastSubmitError(null);
  }, [form]);

  // Handle server validation errors
  const handleServerErrors = useCallback(
    (errors: Record<string, string | string[]>) => {
      Object.keys(errors).forEach(fieldName => {
        const fieldError = errors[fieldName];
        const errorMessage = Array.isArray(fieldError)
          ? fieldError[0]
          : fieldError;
        form.setError(fieldName as Path<T>, { message: errorMessage });
      });
    },
    [form]
  );

  // Field validation helpers
  const validateField = useCallback(
    async (name: Path<T>) => {
      const result = await form.trigger(name);
      return result;
    },
    [form]
  );

  const validateAllFields = useCallback(async () => {
    const result = await form.trigger();
    return result;
  }, [form]);

  // Enhanced submit handler with comprehensive error handling
  const handleSubmitWithErrorHandling = useCallback(
    (onValid: (data: T) => void | Promise<void>) => {
      return async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        setSubmitAttempts(prev => prev + 1);

        // Check network connectivity if enabled
        if (
          enableNetworkValidation &&
          (!isConnected || isInternetReachable === false)
        ) {
          const error = new Error('No internet connection');
          setLastSubmitError(error);

          if (showNetworkErrors) {
            Alert.alert(
              'No Internet Connection',
              'Please check your internet connection and try again.',
              [{ text: 'OK' }]
            );
          }

          onError?.(error);
          return;
        }

        try {
          // Validate form
          const isValid = await form.trigger();
          if (!isValid) {
            return;
          }

          const data = form.getValues();
          await onValid(data);

          // Success handling
          setLastSubmitError(null);
          setSubmitAttempts(0);
          onSuccess?.(data);
        } catch (error) {
          setLastSubmitError(error);
          ErrorHandler.logError(error, 'Form submission');

          // Handle different types of errors
          if (NetworkUtils.isNetworkError(error)) {
            if (showNetworkErrors) {
              Alert.alert(
                'Network Error',
                'Unable to submit form. Please check your connection and try again.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Retry',
                    onPress: () => handleSubmitWithErrorHandling(onValid)(e),
                  },
                ]
              );
            }
          } else {
            // Handle API validation errors
            if (error?.data?.errors) {
              handleServerErrors(error.data.errors);
            } else {
              // Show generic error
              const errorMessage = ErrorHandler.getContextualError(
                error,
                'form'
              );
              if (showNetworkErrors) {
                Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
              }
            }
          }

          onError?.(error);
        }
      };
    },
    [
      form,
      isConnected,
      enableNetworkValidation,
      showNetworkErrors,
      onError,
      onSuccess,
      handleServerErrors,
    ]
  );

  // Submit handler with automatic retry logic
  const handleSubmitWithRetry = useCallback(
    (onValid: (data: T) => void | Promise<void>) => {
      return async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        setIsSubmittingWithRetry(true);

        try {
          // Check network connectivity first
          if (
            enableNetworkValidation &&
            (!isConnected || isInternetReachable === false)
          ) {
            const error = new Error('No internet connection');
            setLastSubmitError(error);

            if (showNetworkErrors) {
              Alert.alert(
                'No Internet Connection',
                'Please check your internet connection and try again.',
                [{ text: 'OK' }]
              );
            }

            onError?.(error);
            return;
          }

          // Validate form first
          const isValid = await form.trigger();
          if (!isValid) {
            return;
          }

          const data = form.getValues();

          // Execute with retry logic
          await NetworkUtils.retryWithBackoff(
            async () => {
              await onValid(data);
            },
            retryAttempts,
            retryDelay
          );

          // Success handling
          setLastSubmitError(null);
          setSubmitAttempts(0);
          onSuccess?.(data);
        } catch (error) {
          setLastSubmitError(error);
          setSubmitAttempts(prev => prev + 1);

          // Handle server validation errors
          if (error?.data?.errors) {
            handleServerErrors(error.data.errors);
          }

          onError?.(error);
        } finally {
          setIsSubmittingWithRetry(false);
        }
      };
    },
    [
      form,
      retryAttempts,
      retryDelay,
      onSuccess,
      onError,
      handleServerErrors,
      enableNetworkValidation,
      isConnected,
      isInternetReachable,
      showNetworkErrors,
    ]
  );

  // Auto-clear network-related errors when connection is restored
  useEffect(() => {
    if (isConnected && isInternetReachable && form.formState.errors) {
      const errors = form.formState.errors;
      Object.keys(errors).forEach(fieldName => {
        const error = errors[fieldName as keyof typeof errors];
        if (
          error?.message?.includes('network') ||
          error?.message?.includes('connection')
        ) {
          form.clearErrors(fieldName as Path<T>);
        }
      });

      if (lastSubmitError && NetworkUtils.isNetworkError(lastSubmitError)) {
        setLastSubmitError(null);
      }
    }
  }, [isConnected, isInternetReachable, form, lastSubmitError]);

  // Computed properties
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const hasChanges = form.formState.isDirty;
  const canSubmit =
    form.formState.isValid &&
    !form.formState.isSubmitting &&
    !isSubmittingWithRetry &&
    isConnected &&
    isInternetReachable !== false;

  return {
    ...form,
    handleSubmitWithErrorHandling,
    handleSubmitWithRetry,
    getFieldProps,
    getFieldError,
    hasFieldError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleServerErrors,
    validateField,
    validateAllFields,
    isOffline: !isConnected || isInternetReachable === false,
    isOnline: isConnected && isInternetReachable !== false,
    isSubmittingWithRetry,
    submitAttempts,
    lastSubmitError,
    hasErrors,
    hasChanges,
    canSubmit,
  };
}
