import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ProfileScreen } from '../profile/ProfileScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { ThemeProvider } from '../../theme';

// Mock the store hooks
jest.mock('../../stores', () => ({
  useAuthStore: jest.fn(),
  useAppStore: jest.fn(),
}));

import { useAuthStore, useAppStore } from '../../stores';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

const mockUser = {
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
};

const mockAuthStore = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  token: 'test-token',
  refreshToken: 'test-refresh-token',
  lastLoginAt: '2023-01-01T00:00:00Z',
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

describe('Screen Navigation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileScreen', () => {
    it('renders user information correctly', () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
    });

    it('navigates to edit profile when button is pressed', () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    });

    it('handles logout action', () => {
      const mockLogout = jest.fn();
      const authState = { ...mockAuthStore, logout: mockLogout };

      const { getByText } = renderWithProviders(<ProfileScreen />, authState);

      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('SettingsScreen', () => {
    it('displays current theme mode', () => {
      const { getByText } = renderWithProviders(<SettingsScreen />);
      expect(getByText(/Theme:/)).toBeTruthy();
    });

    it('displays app version information', () => {
      const { getByText } = renderWithProviders(<SettingsScreen />);
      expect(getByText(/Version: 1.0.0/)).toBeTruthy();
    });

    it('navigates to app settings when button is pressed', () => {
      const { getByText } = renderWithProviders(<SettingsScreen />);

      const settingsButton = getByText('App Settings');
      fireEvent.press(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('AppSettings');
    });

    it('shows online status correctly', () => {
      const { getByText } = renderWithProviders(<SettingsScreen />);
      expect(getByText(/Online/)).toBeTruthy();
    });

    it('shows offline status when offline', () => {
      const appState = { isOnline: false };

      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        {},
        appState
      );
      expect(getByText(/Offline/)).toBeTruthy();
    });
  });
});
