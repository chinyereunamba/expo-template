import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

// Import home screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { DetailsScreen } from '../screens/home/DetailsScreen';
import { SearchScreen } from '../screens/home/SearchScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
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
        name='HomeScreen'
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false, // Home screen will have its own header
        }}
      />
      <Stack.Screen
        name='Details'
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Details',
          headerShown: true,
        })}
      />
      <Stack.Screen
        name='Search'
        component={SearchScreen}
        options={{
          title: 'Search',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};
