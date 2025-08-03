import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

// Import settings screens
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AppSettingsScreen } from '../screens/settings/AppSettingsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { HelpScreen } from '../screens/settings/HelpScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name='SettingsScreen'
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false, // Settings screen will have its own header
        }}
      />
      <Stack.Screen
        name='AppSettings'
        component={AppSettingsScreen}
        options={{
          title: 'App Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='Privacy'
        component={PrivacyScreen}
        options={{
          title: 'Privacy',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='About'
        component={AboutScreen}
        options={{
          title: 'About',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='Help'
        component={HelpScreen}
        options={{
          title: 'Help & Support',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};
