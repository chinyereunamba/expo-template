import { useCallback, useState } from 'react';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function useErrorBoundary() {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
  });

  const captureError = useCallback((error: Error) => {
    if (__DEV__) {
      console.error('Error captured by useErrorBoundary:', error);
    }

    setErrorState({
      hasError: true,
      error,
    });
  }, []);

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
    });
  }, []);

  const throwError = useCallback((error: Error) => {
    throw error;
  }, []);

  return {
    ...errorState,
    captureError,
    resetError,
    throwError,
  };
}
