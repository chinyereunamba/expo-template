import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../../store';

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  style?: any;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showWhenOnline = false,
  style,
}) => {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  const isOffline = !isConnected || isInternetReachable === false;

  React.useEffect(() => {
    if (isOffline || showWhenOnline) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, showWhenOnline, fadeAnim]);

  if (!isOffline && !showWhenOnline) {
    return null;
  }

  const backgroundColor = isOffline ? '#FF6B6B' : '#4ECDC4';
  const textColor = '#FFFFFF';
  const iconName = isOffline ? 'cloud-offline-outline' : 'cloud-done-outline';
  const message = isOffline ? 'No Internet Connection' : 'Connected';

  return (
    <Animated.View
      style={[styles.container, { backgroundColor, opacity: fadeAnim }, style]}
    >
      <Ionicons name={iconName} size={16} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
