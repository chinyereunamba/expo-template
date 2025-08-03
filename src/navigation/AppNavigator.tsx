import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '../hooks/redux';
import { RootStackParamList } from '../types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen } from '../screens/LoadingScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const { isFirstLaunch } = useAppSelector(state => state.app);

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Deep linking configuration
  const linking = {
    prefixes: ['expomobileskeleton://', 'https://expomobileskeleton.com'],
    config: {
      screens: {
        Auth: {
          screens: {
            Welcome: 'welcome',
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
            ResetPassword: 'reset-password/:token',
            VerifyEmail: 'verify-email/:email',
          },
        },
        Main: {
          screens: {
            Home: {
              screens: {
                HomeScreen: 'home',
                Details: 'details/:id',
                Search: 'search',
              },
            },
            Profile: {
              screens: {
                ProfileScreen: 'profile',
                EditProfile: 'profile/edit',
                UserSettings: 'profile/settings',
                ChangePassword: 'profile/change-password',
              },
            },
            Notifications: 'notifications',
            Settings: {
              screens: {
                SettingsScreen: 'settings',
                AppSettings: 'settings/app',
                Privacy: 'settings/privacy',
                About: 'settings/about',
                Help: 'settings/help',
              },
            },
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name='Main' component={MainNavigator} />
        ) : (
          <Stack.Screen name='Auth' component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
