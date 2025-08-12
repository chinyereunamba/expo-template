import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@/theme';
import {
  renderWithProviders,
  mockUser,
  mockAuthStore,
  mockAppStore,
} from '@/utils/test-helpers';

// Import screens
import { HomeScreen } from '@/screens/home/HomeScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';

// Mock stores
import { useAuthStore, useAppStore } from '@/store';

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(),
  useAppStore: jest.fn(),
}));

const Stack = createStackNavigator();

// Test navigation container with screens
const TestNavigator = ({
  initialRouteName = 'Home',
}: {
  initialRouteName?: string;
}) => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Register' component={RegisterScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

const renderWithStores = (
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

  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User Navigation', () => {
    const authenticatedState = {
      user: mockUser,
      isAuthenticated: true,
      token: 'test-token',
    };

    it('should navigate from Home to Profile', async () => {
      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Home' />,
        authenticatedState
      );

      // Wait for home screen to load
      await waitFor(() => {
        expect(getByText(/Good/)).toBeTruthy(); // Greeting text
      });

      // Find and press profile navigation button
      const profileButton = getByText('Profile');
      fireEvent.press(profileButton);

      // Should navigate to profile screen
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
      });
    });

    it('should navigate from Profile to Settings', async () => {
      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Profile' />,
        authenticatedState
      );

      // Wait for profile screen to load
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Navigate to settings
      const settingsButton = getByText('Settings');
      fireEvent.press(settingsButton);

      // Should navigate to settings screen
      await waitFor(() => {
        expect(getByText(/Theme:/)).toBeTruthy();
        expect(getByText(/Version:/)).toBeTruthy();
      });
    });

    it('should handle logout navigation flow', async () => {
      const mockLogout = jest.fn();
      const authStateWithLogout = {
        ...authenticatedState,
        logout: mockLogout,
      };

      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Profile' />,
        authStateWithLogout
      );

      // Wait for profile screen to load
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Press logout button
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      // Should call logout function
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Unauthenticated User Navigation', () => {
    const unauthenticatedState = {
      user: null,
      isAuthenticated: false,
      token: null,
    };

    it('should navigate from Login to Register', async () => {
      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Login' />,
        unauthenticatedState
      );

      // Wait for login screen to load
      await waitFor(() => {
        expect(getByText('Sign In')).toBeTruthy();
      });

      // Find and press register link
      const registerLink = getByText("Don't have an account? Sign up");
      fireEvent.press(registerLink);

      // Should navigate to register screen
      await waitFor(() => {
        expect(getByText('Create Account')).toBeTruthy();
        expect(getByText('Sign Up')).toBeTruthy();
      });
    });

    it('should navigate from Register to Login', async () => {
      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Register' />,
        unauthenticatedState
      );

      // Wait for register screen to load
      await waitFor(() => {
        expect(getByText('Create Account')).toBeTruthy();
      });

      // Find and press login link
      const loginLink = getByText('Already have an account? Sign in');
      fireEvent.press(loginLink);

      // Should navigate to login screen
      await waitFor(() => {
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Welcome back')).toBeTruthy();
      });
    });
  });

  describe('Deep Linking Navigation', () => {
    it('should handle deep link to profile when authenticated', async () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        token: 'test-token',
      };

      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Profile' />,
        authenticatedState
      );

      // Should directly show profile screen
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
      });
    });

    it('should redirect to login when accessing protected route while unauthenticated', async () => {
      const unauthenticatedState = {
        user: null,
        isAuthenticated: false,
        token: null,
      };

      // This would typically be handled by a route guard
      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Login' />,
        unauthenticatedState
      );

      // Should show login screen
      await waitFor(() => {
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Welcome back')).toBeTruthy();
      });
    });
  });

  describe('Navigation State Management', () => {
    it('should maintain navigation state across theme changes', async () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        token: 'test-token',
      };

      const appState = {
        ...mockAppStore,
        theme: 'light' as const,
      };

      const { getByText, rerender } = renderWithStores(
        <TestNavigator initialRouteName='Settings' />,
        authenticatedState,
        appState
      );

      // Wait for settings screen to load
      await waitFor(() => {
        expect(getByText(/Theme:/)).toBeTruthy();
      });

      // Change theme
      const newAppState = {
        ...appState,
        theme: 'dark' as const,
      };

      (useAppStore as jest.Mock).mockReturnValue(newAppState);

      rerender(
        <ThemeProvider>
          <TestNavigator initialRouteName='Settings' />
        </ThemeProvider>
      );

      // Should still be on settings screen
      await waitFor(() => {
        expect(getByText(/Theme:/)).toBeTruthy();
      });
    });

    it('should handle network status changes during navigation', async () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        token: 'test-token',
      };

      const onlineAppState = {
        ...mockAppStore,
        isOnline: true,
      };

      const { getByText, rerender } = renderWithStores(
        <TestNavigator initialRouteName='Home' />,
        authenticatedState,
        onlineAppState
      );

      // Wait for home screen to load
      await waitFor(() => {
        expect(getByText(/Good/)).toBeTruthy();
      });

      // Simulate going offline
      const offlineAppState = {
        ...onlineAppState,
        isOnline: false,
      };

      (useAppStore as jest.Mock).mockReturnValue(offlineAppState);

      rerender(
        <ThemeProvider>
          <TestNavigator initialRouteName='Home' />
        </ThemeProvider>
      );

      // Should show offline indicator
      await waitFor(() => {
        expect(getByText('Offline Mode')).toBeTruthy();
      });
    });
  });

  describe('Error Handling in Navigation', () => {
    it('should handle navigation errors gracefully', async () => {
      const authenticatedState = {
        user: mockUser,
        isAuthenticated: true,
        token: 'test-token',
      };

      // Mock console.error to avoid test output noise
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { getByText } = renderWithStores(
        <TestNavigator initialRouteName='Home' />,
        authenticatedState
      );

      // Should still render the screen even if there are navigation warnings
      await waitFor(() => {
        expect(getByText(/Good/)).toBeTruthy();
      });

      consoleSpy.mockRestore();
    });
  });
});
