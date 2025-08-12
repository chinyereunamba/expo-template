import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

// Import tab navigators with lazy loading
import { createLazyScreen } from '../utils/lazyLoading';

const HomeNavigator = createLazyScreen(() =>
  import('./HomeNavigator').then(m => ({ default: m.HomeNavigator }))
);
const ProfileNavigator = createLazyScreen(() =>
  import('./ProfileNavigator').then(m => ({ default: m.ProfileNavigator }))
);
const SettingsNavigator = createLazyScreen(() =>
  import('./SettingsNavigator').then(m => ({ default: m.SettingsNavigator }))
);
const NotificationsScreen = createLazyScreen(() =>
  import('../screens/NotificationsScreen').then(m => ({
    default: m.NotificationsScreen,
  }))
);

// Import icons (using a simple icon component for now)
import { TabBarIcon } from '../components/common/TabBarIcon';

// Import debug screen (development only)
import { APP_CONFIG } from '../config/environment';
let DebugScreen: React.ComponentType | null = null;
if (APP_CONFIG.DEBUG) {
  DebugScreen = require('../screens/debug').DebugScreen;
}

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
      {APP_CONFIG.DEBUG && DebugScreen && (
        <Tab.Screen
          name='Debug'
          component={DebugScreen}
          options={{
            tabBarLabel: 'Debug',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

// Helper function to get tab bar icon names
const getTabBarIconName = (
  routeName: keyof MainTabParamList | 'Debug'
): string => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Profile':
      return 'person';
    case 'Notifications':
      return 'notifications';
    case 'Settings':
      return 'settings';
    case 'Debug':
      return 'bug-report';
    default:
      return 'home';
  }
};
