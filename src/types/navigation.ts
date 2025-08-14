import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  RouteProp,
} from '@react-navigation/native';

// Root navigation stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined | { screen?: keyof MainTabParamList; params?: object };
  Onboarding: undefined;
  Loading: undefined;
};

// Authentication stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
};

// Main tab navigation (base)
type BaseMainTabParamList = {
  Home: undefined;
  Profile: { userId?: string };
  Settings: undefined;
  Notifications: undefined;
};

// Debug tab (development only)
type DebugTabParamList = {
  Debug: undefined;
};

// Main tab navigation (conditional debug tab)
export type MainTabParamList = BaseMainTabParamList & DebugTabParamList;

// Home stack (nested in Home tab)
export type HomeStackParamList = {
  HomeScreen: undefined;
  Details: { id: string; title?: string };
  Search: { query?: string };
};

// Profile stack (nested in Profile tab)
export type ProfileStackParamList = {
  ProfileScreen: { userId?: string };
  EditProfile: undefined;
  UserSettings: undefined;
  ChangePassword: undefined;
};

// Settings stack (nested in Settings tab)
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  AppSettings: undefined;
  Privacy: undefined;
  About: undefined;
  Help: undefined;
};

// Navigation prop types for screens
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type HomeStackNavigationProp = StackNavigationProp<HomeStackParamList>;
export type ProfileStackNavigationProp =
  StackNavigationProp<ProfileStackParamList>;
export type SettingsStackNavigationProp =
  StackNavigationProp<SettingsStackParamList>;

// Composite navigation props (for nested navigators)
export type HomeTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<HomeStackParamList>
>;

export type ProfileTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<ProfileStackParamList>
>;

export type SettingsTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  StackNavigationProp<SettingsStackParamList>
>;

// Route prop types for screens
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<
  MainTabParamList,
  T
>;

export type HomeStackRouteProp<T extends keyof HomeStackParamList> = RouteProp<
  HomeStackParamList,
  T
>;

export type ProfileStackRouteProp<T extends keyof ProfileStackParamList> =
  RouteProp<ProfileStackParamList, T>;

export type SettingsStackRouteProp<T extends keyof SettingsStackParamList> =
  RouteProp<SettingsStackParamList, T>;

// Screen props combining navigation and route
export type ScreenProps<NavigationProp, RouteProp> = {
  navigation: NavigationProp;
  route: RouteProp;
};
