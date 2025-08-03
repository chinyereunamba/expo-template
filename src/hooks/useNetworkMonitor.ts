import { useEffect, useRef } from 'react';
import { useNetworkStore } from '../stores';
import { NetworkUtils } from '../utils/network';
import { queryClient } from '../services/queryClient';

export const useNetworkMonitor = () => {
  const { updateNetworkStatus, setConnectionStatus } = useNetworkStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize network status
    const initializeNetworkStatus = async () => {
      try {
        const status = await NetworkUtils.getNetworkStatus();
        updateNetworkStatus(status);
      } catch (error) {
        console.error('Failed to get initial network status:', error);
      }
    };

    // Subscribe to network changes
    const subscribeToNetworkChanges = () => {
      unsubscribeRef.current = NetworkUtils.subscribeToNetworkState(status => {
        updateNetworkStatus(status);

        // Handle online/offline transitions for React Query
        if (status.isConnected && status.isInternetReachable) {
          // Coming back online - refetch stale queries
          queryClient.refetchQueries({
            type: 'active',
            stale: true,
          });
        }
      });
    };

    initializeNetworkStatus();
    subscribeToNetworkChanges();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [updateNetworkStatus]);

  // Return network utilities for manual checks
  return {
    checkConnection: NetworkUtils.isOnline,
    waitForConnection: NetworkUtils.waitForConnection,
    getNetworkType: NetworkUtils.getNetworkType,
    isConnectionExpensive: NetworkUtils.isConnectionExpensive,
  };
};
