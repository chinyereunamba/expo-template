import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

// Import tab navigators
import { HomeNavigator } from './HomeNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { NotificationsScreen } from '../screens/NotificationsScreen';

// Import icons (using a simple icon component for now)
import { TabBarIcon } from '../components/common/TabBarIcon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon
            name={getTabBarIconName(route.name)}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name='Notifications'
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Notifications',
          tabBarBadge: undefined, // Can be set dynamically based on unread count
        }}
      />
      <Tab.Screen
        name='Settings'
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Helper function to get tab bar icon names
const getTabBarIconName = (routeName: keyof MainTabParamList): string => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Profile':
      return 'person';
    case 'Notifications':
      return 'notifications';
    case 'Settings':
      return 'settings';
    default:
      return 'home';
  }
};
