import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isConnectionExpensive: boolean | null;
}

// Network utility functions
export const NetworkUtils = {
  // Check if device is online
  isOnline: async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  },

  // Get comprehensive network status
  getNetworkStatus: async (): Promise<NetworkStatus> => {
    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected ?? false,
      isInternetReachable: netInfo.isInternetReachable,
      type: netInfo.type,
      isConnectionExpensive: netInfo.isConnectionExpensive,
    };
  },

  // Subscribe to network state changes with full state
  subscribeToNetworkState: (callback: (status: NetworkStatus) => void) => {
    return NetInfo.addEventListener((state: NetInfoState) => {
      callback({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isConnectionExpensive: state.isConnectionExpensive,
      });
    });
  },

  // Get network type
  getNetworkType: async (): Promise<string | null> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.type;
  },

  // Check if connection is expensive (cellular data)
  isConnectionExpensive: async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnectionExpensive ?? false;
  },

  // Wait for connection to be restored
  waitForConnection: (timeout: number = 10000): Promise<boolean> => {
    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });

      // Check current state immediately
      NetInfo.fetch().then(state => {
        if (state.isConnected && state.isInternetReachable) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  },

  // Retry function with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry if it's not a network error
        if (!NetworkUtils.isNetworkError(error)) {
          throw error;
        }

        // Don't wait after the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait for connection if offline
        const isOnline = await NetworkUtils.isOnline();
        if (!isOnline) {
          const connectionRestored = await NetworkUtils.waitForConnection(5000);
          if (!connectionRestored) {
            throw new Error('Network connection could not be restored');
          }
        }

        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },

  // Check if error is network-related
  isNetworkError: (error: any): boolean => {
    return (
      error?.status === 'FETCH_ERROR' ||
      error?.name === 'NetworkError' ||
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('fetch')
    );
  },
};
