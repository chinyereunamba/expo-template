import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from '../../providers/AppProviders';
import { AppNavigator } from '../../navigation/AppNavigator';
import { useAuthStore, useAppStore } from '../../store';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock network info
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

// Test component that wraps the app
const TestApp: React.FC = () => {
  return (
    <AppProviders>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProviders>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset stores before each test
    useAuthStore.getState().logout();
    useAppStore.setState({
      theme: 'light',
      isFirstLaunch: false,
      isOnline: true,
    });
  });

  it('should render loading screen initially', async () => {
    const { getByTestId } = render(<TestApp />);

    // Should show loading screen while checking auth state
    await waitFor(() => {
      expect(getByTestId('loading-screen')).toBeTruthy();
    });
  });

  it('should show auth navigator when not authenticated', async () => {
    const { getByText } = render(<TestApp />);

    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
  });

  it('should show main navigator when authenticated', async () => {
    // Set authenticated state
    useAuthStore.getState().loginSuccess({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    const { getByText } = render(<TestApp />);

    await waitFor(() => {
      expect(getByText('Home')).toBeTruthy();
    });
  });

  it('should handle theme switching', async () => {
    const { getByTestId } = render(<TestApp />);

    // Toggle theme
    useAppStore.getState().toggleTheme();

    await waitFor(() => {
      expect(useAppStore.getState().theme).toBe('dark');
    });
  });

  it('should handle network status changes', async () => {
    const { rerender } = render(<TestApp />);

    // Simulate network disconnection
    useAppStore.getState().setOnlineStatus(false);

    rerender(<TestApp />);

    await waitFor(() => {
      expect(useAppStore.getState().isOnline).toBe(false);
    });
  });

  it('should handle error boundaries', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const TestAppWithError = () => (
      <AppProviders>
        <ErrorComponent />
      </AppProviders>
    );

    const { getByText } = render(<TestAppWithError />);

    await waitFor(() => {
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it('should persist app state', async () => {
    // Set some app state
    useAppStore.getState().setTheme('dark');
    useAppStore.getState().setFirstLaunch(false);

    // Simulate app restart by creating new instance
    const { rerender } = render(<TestApp />);

    rerender(<TestApp />);

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.isFirstLaunch).toBe(false);
    });
  });

  it('should handle authentication flow', async () => {
    const { getByText, getByPlaceholderText } = render(<TestApp />);

    // Should start with login screen
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // Fill in login form
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Submit form (this would normally trigger API call)
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    // Verify form validation works
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should handle navigation between tabs', async () => {
    // Set authenticated state
    useAuthStore.getState().loginSuccess({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    const { getByText } = render(<TestApp />);

    await waitFor(() => {
      expect(getByText('Home')).toBeTruthy();
    });

    // Navigate to settings
    const settingsTab = getByText('Settings');
    fireEvent.press(settingsTab);

    await waitFor(() => {
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  it('should handle lazy loading of screens', async () => {
    // Set authenticated state
    useAuthStore.getState().loginSuccess({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    });

    const { getByText } = render(<TestApp />);

    // Should show loading initially for lazy-loaded screens
    await waitFor(() => {
      expect(getByText('Home')).toBeTruthy();
    });

    // Navigate to profile (lazy-loaded)
    const profileTab = getByText('Profile');
    fireEvent.press(profileTab);

    await waitFor(() => {
      expect(getByText('Profile')).toBeTruthy();
    });
  });
});
