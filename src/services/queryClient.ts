import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useNetworkStore } from '../store/networkStore';
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
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time - how long data stays in cache after becoming unused
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }

        // Retry up to 3 times for server errors and network errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations on network errors
      retry: (failureCount, error: any) => {
        // Don't retry client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }

        // Check if we're online before retrying
        const networkState = useNetworkStore.getState();
        if (!networkState.isConnected) {
          return false;
        }

        return failureCount < 2;
      },

      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
  },

  // Global query cache configuration
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Log errors for debugging
      ErrorHandler.logError(error, `Query ${query.queryKey.join('-')}`);

      // Handle network errors
      if (ErrorHandler.isRetryableError(error)) {
        const networkActions = useNetworkStore.getState();
        networkActions.incrementRetryCount();
      }
    },
    onSuccess: (data, query) => {
      // Reset retry count on successful query
      const networkActions = useNetworkStore.getState();
      networkActions.resetRetryCount();
    },
  }),

  // Global mutation cache configuration
  mutationCache: new MutationCache({
    onError: (error: any, variables, context, mutation) => {
      // Log mutation errors
      ErrorHandler.logError(
        error,
        `Mutation ${mutation.options.mutationKey?.join('-') || 'unknown'}`
      );
    },
    onSuccess: (data, variables, context, mutation) => {
      // Reset retry count on successful mutation
      const networkActions = useNetworkStore.getState();
      networkActions.resetRetryCount();
    },
  }),
});

// Initialize offline persistence
export const initializeQueryPersistence = async () => {
  try {
    await persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      buster: '1.0.0', // Change this to invalidate cache on app updates
      dehydrateOptions: {
        shouldDehydrateQuery: query => {
          // Only persist successful queries
          return query.state.status === 'success';
        },
        shouldDehydrateMutation: () => false, // Don't persist mutations
      },
    });
  } catch (error) {
    console.error('Failed to initialize query persistence:', error);
  }
};

// Network status integration
export const setupNetworkStatusIntegration = () => {
  // Subscribe to network changes
  const unsubscribe = useNetworkStore.subscribe(
    state => state.isConnected,
    (isConnected, previousIsConnected) => {
      // When coming back online, refetch all queries
      if (isConnected && !previousIsConnected) {
        queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });
      }

      // When going offline, pause queries
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
  // Clear all cached data
  clearAll: () => {
    queryClient.clear();
  },

  // Clear specific query
  clearQuery: (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },

  // Invalidate and refetch queries
  invalidateQueries: (queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  // Prefetch query
  prefetchQuery: (queryKey: any[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  },

  // Set query data manually
  setQueryData: (queryKey: any[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get cached query data
  getQueryData: (queryKey: any[]) => {
    return queryClient.getQueryData(queryKey);
  },

  // Check if query exists in cache
  hasQuery: (queryKey: any[]) => {
    return queryClient.getQueryCache().find({ queryKey }) !== undefined;
  },

  // Get cache stats
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
