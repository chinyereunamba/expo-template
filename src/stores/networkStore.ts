import { create } from 'zustand';
import { NetworkStatus } from '../utils/network';

interface NetworkStore extends NetworkStatus {
  retryCount: number;
  networkType: string | null;

  // Actions
  updateNetworkStatus: (status: NetworkStatus) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setConnectionType: (type: string | null) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
}

const initialState: NetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  type: null,
  isConnectionExpensive: null,
};

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  ...initialState,
  retryCount: 0,
  networkType: null,

  updateNetworkStatus: (status: NetworkStatus) =>
    set({
      ...status,
      networkType: status.type,
    }),

  setConnectionStatus: (isConnected: boolean) => set({ isConnected }),

  setOnlineStatus: (isOnline: boolean) => set({ isConnected: isOnline }),

  setConnectionType: (type: string | null) => set({ type, networkType: type }),

  incrementRetryCount: () =>
    set(state => ({ retryCount: state.retryCount + 1 })),

  resetRetryCount: () => set({ retryCount: 0 }),
}));
