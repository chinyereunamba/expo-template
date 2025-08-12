import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  color,
  size,
}) => {
  // Simple icon implementation using text
  // In a real app, you would use react-native-vector-icons or similar
  const getIconText = (iconName: string): string => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'person':
        return '👤';
      case 'notifications':
        return '🔔';
      case 'settings':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>
        {getIconText(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  focused: {
    transform: [{ scale: 1.1 }],
  },
  icon: {
    textAlign: 'center',
  },
});
