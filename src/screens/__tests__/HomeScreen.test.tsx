import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { HomeScreen } from '../home/HomeScreen';
import { ThemeProvider } from '../../theme';
import authSlice from '../../store/slices/authSlice';
import appSlice from '../../store/slices/appSlice';

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

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    expect(getByText(/Good/)).toBeTruthy(); // Should show greeting
  });

  it('displays user name when authenticated', () => {
    const initialState = {
      auth: {
        user: { name: 'John Doe', email: 'john@example.com' },
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

    const { getByText } = renderWithProviders(<HomeScreen />, initialState);

    expect(getByText(/John Doe/)).toBeTruthy();
  });

  it('shows offline indicator when offline', () => {
    const initialState = {
      auth: {
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        lastLoginAt: null,
      },
      app: {
        theme: 'light',
        isFirstLaunch: false,
        isOnline: false, // Offline
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

    const { getByText } = renderWithProviders(<HomeScreen />, initialState);

    expect(getByText('Offline Mode')).toBeTruthy();
  });
});
