import React, { useEffect, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  queryClient,
  initializeQueryPersistence,
  setupNetworkStatusIntegration,
} from '../services/queryClient';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';

interface ApiProviderProps {
  children: ReactNode;
}

// Network monitor component
const NetworkMonitor: React.FC = () => {
  useNetworkMonitor();
  return null;
};

// Query client setup component
const QueryClientSetup: React.FC = () => {
  useEffect(() => {
    let networkUnsubscribe: (() => void) | undefined;

    const setupApi = async () => {
      try {
        // Initialize offline persistence
        await initializeQueryPersistence();

        // Setup network status integration
        networkUnsubscribe = setupNetworkStatusIntegration();

        console.log('API provider initialized successfully');
      } catch (error) {
        console.error('Failed to initialize API provider:', error);
      }
    };

    setupApi();

    // Cleanup on unmount
    return () => {
      if (networkUnsubscribe) {
        networkUnsubscribe();
      }
    };
  }, []);

  return null;
};

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientSetup />
      <NetworkMonitor />
      {children}
    </QueryClientProvider>
  );
};

export default ApiProvider;
