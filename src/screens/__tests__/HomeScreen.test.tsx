import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../home/HomeScreen';
import { ThemeProvider } from '../../theme';

import { useAuthStore, useAppStore } from '../../store';

// Mock the store hooks
jest.mock('@/store', () => ({
  useAuthStore: jest.fn(),
  useAppStore: jest.fn(),
}));

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  lastLoginAt: null,
  setLoading: jest.fn(),
  setError: jest.fn(),
  loginSuccess: jest.fn(),
  updateUser: jest.fn(),
  updateTokens: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
};

const mockAppStore = {
  theme: 'light' as const,
  isFirstLaunch: false,
  notifications: {
    enabled: true,
    categories: {
      general: true,
      security: true,
      marketing: false,
      updates: true,
    },
    schedule: {
      startTime: '08:00',
      endTime: '22:00',
      timezone: 'UTC',
    },
  },
  isOnline: true,
  appVersion: '1.0.0',
  buildNumber: '1',
  lastUpdated: null,
  settings: {
    language: 'en',
    region: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY' as const,
    timeFormat: '12h' as const,
    biometricEnabled: false,
    autoLockTimeout: 5,
    crashReporting: true,
    analytics: true,
  },
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
  setFirstLaunch: jest.fn(),
  setNotifications: jest.fn(),
  setOnlineStatus: jest.fn(),
  setAppSettings: jest.fn(),
  setAppVersion: jest.fn(),
};

const renderWithProviders = (
  component: React.ReactElement,
  authState = {},
  appState = {}
) => {
  (useAuthStore as jest.Mock).mockReturnValue({
    ...mockAuthStore,
    ...authState,
  });

  (useAppStore as jest.Mock).mockReturnValue({
    ...mockAppStore,
    ...appState,
  });

  return render(
    <ThemeProvider>
      <NavigationContainer>{component}</NavigationContainer>
    </ThemeProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText(/Good/)).toBeTruthy(); // Should show greeting
  });

  it('displays user name when authenticated', () => {
    const authState = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        isPhoneVerified: false,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public' as const,
            showOnlineStatus: true,
          },
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      token: 'test-token',
    };

    const { getByText } = renderWithProviders(<HomeScreen />, authState);
    expect(getByText(/John Doe/)).toBeTruthy();
  });

  it('shows offline indicator when offline', () => {
    const appState = {
      isOnline: false,
    };

    const { getByText } = renderWithProviders(<HomeScreen />, {}, appState);
    expect(getByText('Offline Mode')).toBeTruthy();
  });
});
