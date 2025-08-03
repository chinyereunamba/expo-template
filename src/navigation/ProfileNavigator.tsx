import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

// Import profile screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserSettingsScreen } from '../screens/profile/UserSettingsScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
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
        name='ProfileScreen'
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false, // Profile screen will have its own header
        }}
      />
      <Stack.Screen
        name='EditProfile'
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='UserSettings'
        component={UserSettingsScreen}
        options={{
          title: 'User Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name='ChangePassword'
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};
