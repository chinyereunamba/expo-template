import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { tokenManager } from '../services/tokenManager';
import { useNetInfo } from '@react-native-community/netinfo';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, logout, token } = useAuthStore();
  const netInfo = useNetInfo();

  useEffect(() => {
    // Initialize token manager when auth state changes
    if (isAuthenticated && token) {
      tokenManager.initialize();
    } else {
      tokenManager.cleanup();
    }

    return () => {
      tokenManager.cleanup();
    };
  }, [isAuthenticated, token]);

  // Handle network state changes
  useEffect(() => {
    if (netInfo.isConnected && isAuthenticated && token) {
      // When network comes back online, check if token needs refresh
      tokenManager.getValidToken();
    }
  }, [netInfo.isConnected, isAuthenticated, token]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
