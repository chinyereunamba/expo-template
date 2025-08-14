import { QueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '../store';
import { ErrorHandler } from '../utils/errorHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// Create persister for offline caching
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
      onError: (error: any, query) => {
        ErrorHandler.logError(error, `Query ${query.queryKey.join('-')}`);
        if (ErrorHandler.isRetryableError(error)) {
          useNetworkStore.getState().incrementRetryCount();
        }
      },
      onSuccess: () => {
        useNetworkStore.getState().resetRetryCount();
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        const networkState = useNetworkStore.getState();
        if (!networkState.isConnected) {
          return false;
        }
        return failureCount < 2;
      },
      networkMode: 'offlineFirst',
      onError: (error: any, variables, context, mutation) => {
        ErrorHandler.logError(
          error,
          `Mutation ${mutation.options.mutationKey?.join('-') || 'unknown'}`
        );
      },
      onSuccess: () => {
        useNetworkStore.getState().resetRetryCount();
      },
    },
  },
});

// Initialize offline persistence
export const initializeQueryPersistence = async () => {
  try {
    await persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      buster: '1.0.0',
      dehydrateOptions: {
        shouldDehydrateQuery: query => {
          return query.state.status === 'success';
        },
        shouldDehydrateMutation: () => false,
      },
    });
  } catch (error) {
    console.error('Failed to initialize query persistence:', error);
  }
};

// Network status integration
export const setupNetworkStatusIntegration = () => {
  const unsubscribe = useNetworkStore.subscribe(
    state => state.isConnected,
    (isConnected, previousIsConnected) => {
      if (isConnected && !previousIsConnected) {
        queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });
      }
      if (!isConnected && previousIsConnected) {
        queryClient
          .getQueryCache()
          .getAll()
          .forEach(query => {
            query.setState({ ...query.state, fetchStatus: 'paused' });
          });
      }
    }
  );
  return unsubscribe;
};

// Utility functions for cache management
export const cacheUtils = {
  clearAll: () => {
    queryClient.clear();
  },
  clearQuery: (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },
  invalidateQueries: (queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey });
  },
  prefetchQuery: (queryKey: any[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  },
  setQueryData: (queryKey: any[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  },
  getQueryData: (queryKey: any[]) => {
    return queryClient.getQueryData(queryKey);
  },
  hasQuery: (queryKey: any[]) => {
    return queryClient.getQueryCache().find({ queryKey }) !== undefined;
  },
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    return {
      totalQueries: queries.length,
      successfulQueries: queries.filter(q => q.state.status === 'success')
        .length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      staleQueries: queries.filter(q => q.isStale()).length,
    };
  },
};