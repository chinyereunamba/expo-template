import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/theme';
import { lightTheme, darkTheme } from '@/theme/themes';

// Mock data for testing
export const mockUser = {
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

export const mockAuthStore = {
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

export const mockAppStore = {
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

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
  withNavigation?: boolean;
  withQueryClient?: boolean;
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    theme = 'light',
    withNavigation = false,
    withQueryClient = false,
    initialEntries: _initialEntries = ['/'],
    ...renderOptions
  } = options;

  const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

  // Create a new QueryClient for each test to avoid state leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = <ThemeProvider>{children}</ThemeProvider>;

    if (withQueryClient) {
      wrappedChildren = (
        <QueryClientProvider client={queryClient}>
          {wrappedChildren}
        </QueryClientProvider>
      );
    }

    if (withNavigation) {
      wrappedChildren = (
        <NavigationContainer>{wrappedChildren}</NavigationContainer>
      );
    }

    return wrappedChildren;
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Mock navigation functions
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// API Mock helpers
export function createMockApiResponse<T>(data: T, success = true) {
  return {
    data,
    success,
    message: success ? 'Success' : 'Error',
  };
}

export const createMockApiError = (message = 'API Error', status = 500) => ({
  response: {
    status,
    data: {
      message,
      success: false,
    },
  },
});

// Form testing helpers
export const fillForm = async (
  getByPlaceholderText: any,
  formData: Record<string, string>
) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = getByPlaceholderText(field);
    // Use fireEvent.changeText for React Native inputs
    const { fireEvent } = await import('@testing-library/react-native');
    fireEvent.changeText(input, value);
  }
};

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react-native');
  await waitFor(
    () => {
      // Wait for any loading states to complete
    },
    { timeout: 3000 }
  );
};

// Store mock helpers
export const createMockStore = (overrides = {}) => ({
  ...mockAuthStore,
  ...mockAppStore,
  ...overrides,
});

// Network status mock
export const mockNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: {
    isConnectionExpensive: false,
    ssid: 'test-wifi',
    bssid: 'test-bssid',
    strength: 100,
    ipAddress: '192.168.1.1',
    subnet: '255.255.255.0',
  },
};

// Async storage mock helpers
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Test utilities for common assertions
export const expectToBeVisible = (element: any) => {
  expect(element).toBeTruthy();
};

export const expectToHaveText = (element: any, text: string) => {
  expect(element.props.children).toBe(text);
};

export const expectToBeDisabled = (element: any) => {
  expect(element.props.disabled).toBe(true);
};

export const expectToBeEnabled = (element: any) => {
  expect(element.props.disabled).toBeFalsy();
};
