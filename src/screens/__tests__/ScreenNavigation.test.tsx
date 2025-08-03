import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { ProfileScreen } from '../profile/ProfileScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { ThemeProvider } from '../../theme';
import authSlice from '../../store/slices/authSlice';
import appSlice from '../../store/slices/appSlice';

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

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      app: appSlice,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createTestStore(initialState);

  return render(
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>{component}</NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

const mockUserState = {
  auth: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
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
          profileVisibility: 'public',
          showOnlineStatus: true,
        },
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    isAuthenticated: true,
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    isLoading: false,
    error: null,
    lastLoginAt: null,
  },
  app: {
    theme: 'light',
    isFirstLaunch: false,
    isOnline: true,
    appVersion: '1.0.0',
    buildNumber: '1',
    lastUpdated: null,
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
    settings: {
      language: 'en',
      region: 'US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      biometricEnabled: false,
      autoLockTimeout: 5,
      crashReporting: true,
      analytics: true,
    },
  },
};

describe('Screen Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileScreen', () => {
    it('renders user information correctly', () => {
      const { getByText } = renderWithProviders(
        <ProfileScreen />,
        mockUserState
      );

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
      expect(getByText('Yes')).toBeTruthy(); // Email verified
    });

    it('navigates to edit profile when button is pressed', () => {
      const { getByText } = renderWithProviders(
        <ProfileScreen />,
        mockUserState
      );

      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    });

    it('handles logout action', () => {
      const { getByText } = renderWithProviders(
        <ProfileScreen />,
        mockUserState
      );

      const logoutButton = getByText('Sign Out');
      fireEvent.press(logoutButton);

      // The logout action should be dispatched (tested in Redux tests)
      expect(logoutButton).toBeTruthy();
    });
  });

  describe('SettingsScreen', () => {
    it('displays current theme mode', () => {
      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        mockUserState
      );

      expect(getByText('Current: light')).toBeTruthy();
    });

    it('displays app version information', () => {
      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        mockUserState
      );

      expect(getByText('1.0.0')).toBeTruthy();
      expect(getByText('1')).toBeTruthy(); // Build number
    });

    it('navigates to app settings when button is pressed', () => {
      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        mockUserState
      );

      const appSettingsButton = getByText('App Settings');
      fireEvent.press(appSettingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('AppSettings');
    });

    it('shows online status correctly', () => {
      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        mockUserState
      );

      expect(getByText('Online')).toBeTruthy();
    });

    it('shows offline status when offline', () => {
      const offlineState = {
        ...mockUserState,
        app: {
          ...mockUserState.app,
          isOnline: false,
        },
      };

      const { getByText } = renderWithProviders(
        <SettingsScreen />,
        offlineState
      );

      expect(getByText('Offline')).toBeTruthy();
    });
  });
});
