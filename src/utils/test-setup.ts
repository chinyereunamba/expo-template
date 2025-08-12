import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  try {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
  } catch (error) {
    // Fallback mock if reanimated mock is not available
    return {
      default: {
        call: () => {},
      },
      useSharedValue: jest.fn(() => ({ value: 0 })),
      useAnimatedStyle: jest.fn(() => ({})),
      withTiming: jest.fn(value => value),
      withSpring: jest.fn(value => value),
      runOnJS: jest.fn(fn => fn),
      interpolate: jest.fn(),
    };
  }
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        API_URL: 'http://localhost:3000',
        APP_ENV: 'test',
      },
    },
  },
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
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
    }),
    useRoute: () => ({
      key: 'test-route',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
  };
});

// Mock React Navigation Stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
  CardStyleInterpolators: {},
  HeaderStyleInterpolators: {},
  TransitionPresets: {},
}));

// Mock React Navigation Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
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
    })
  ),
  addEventListener: jest.fn(),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock react-native-worklets (only if it exists)
try {
  require.resolve('react-native-worklets');
  jest.mock('react-native-worklets', () => ({
    __esModule: true,
    default: {},
  }));
} catch (e) {
  // Module doesn't exist, skip mocking
}

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock React Native Elements
jest.mock('react-native-elements', () => ({
  Button: 'Button',
  Input: 'Input',
  Card: 'Card',
  Avatar: 'Avatar',
  ListItem: 'ListItem',
  Header: 'Header',
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Zustand stores
jest.mock('@/store', () => ({
  useAuthStore: jest.fn(),
  useAppStore: jest.fn(),
  useNetworkStore: jest.fn(),
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {},
    handleSubmit: jest.fn(fn => fn),
    formState: { errors: {}, isValid: true, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    watch: jest.fn(),
    trigger: jest.fn(),
  })),
  Controller: ({ render }: any) =>
    render({ field: { onChange: jest.fn(), value: '' } }),
}));

// Mock Yup
jest.mock('yup', () => ({
  object: jest.fn(() => ({
    shape: jest.fn(() => ({
      isValid: jest.fn(() => Promise.resolve(true)),
      validate: jest.fn(() => Promise.resolve({})),
    })),
  })),
  string: jest.fn(() => ({
    required: jest.fn(() => ({ email: jest.fn(() => ({})) })),
    email: jest.fn(() => ({ required: jest.fn(() => ({})) })),
    min: jest.fn(() => ({ required: jest.fn(() => ({})) })),
  })),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
    data: null,
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Silence console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('useNativeDriver') ||
        args[0].includes('Animated') ||
        args[0].includes('VirtualizedLists'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
        args[0].includes('useNativeDriver') ||
        args[0].includes('Animated'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
