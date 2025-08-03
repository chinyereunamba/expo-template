import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isConnected: boolean;
}

interface NetworkStore extends NetworkState {
  setOnlineStatus: (isOnline: boolean) => void;
  setConnectionType: (
    type: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  ) => void;
  setConnected: (isConnected: boolean) => void;
}

const initialState: NetworkState = {
  isOnline: true,
  connectionType: 'unknown',
  isConnected: true,
};

export const useNetworkStore = create<NetworkStore>(set => ({
  ...initialState,

  setOnlineStatus: (isOnline: boolean) => set({ isOnline }),

  setConnectionType: (
    connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  ) => set({ connectionType }),

  setConnected: (isConnected: boolean) => set({ isConnected }),
}));
