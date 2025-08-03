import NetInfo from '@react-native-community/netinfo';

// Network utility functions
export const NetworkUtils = {
  // Check if device is online
  isOnline: async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  },

  // Subscribe to network state changes
  subscribeToNetworkState: (callback: (isConnected: boolean) => void) => {
    return NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
  },

  // Get network type
  getNetworkType: async (): Promise<string | null> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.type;
  },
};
