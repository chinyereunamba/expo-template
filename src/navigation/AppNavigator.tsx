import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store';
import { RootStackParamList } from '../types';
import { createLazyScreen } from '../utils/lazyLoading';
import { LoadingScreen } from '../screens/LoadingScreen';

const AuthNavigator = createLazyScreen(() =>
  import('./AuthNavigator').then(m => ({ default: m.AuthNavigator }))
);
const MainNavigator = createLazyScreen(() =>
  import('./MainNavigator').then(m => ({ default: m.MainNavigator }))
);

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Deep linking configuration
  const linking = {
    prefixes: ['expomobileskeleton://', 'https://expomobileskeleton.com'],
    config: {
      screens: {
        Auth: 'auth',
        Main: 'main',
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
