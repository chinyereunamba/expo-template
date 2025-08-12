import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../../stores';
import { useTheme } from '../../hooks/useTheme';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showWhenOnline = false,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const { theme } = useTheme();
  const { isConnected, isInternetReachable, networkType } = useNetworkStore();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const isOnline = isConnected && isInternetReachable;

  useEffect(() => {
    const shouldShow = !isOnline || showWhenOnline;

    if (shouldShow) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoHide && isOnline) {
        const timer = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setVisible(false));
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else if (!shouldShow && visible) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOnline, showWhenOnline, autoHide, autoHideDelay, visible, slideAnim]);

  if (!visible) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        text: 'No Internet Connection',
        icon: 'wifi-outline' as const,
        backgroundColor: theme.colors.error,
        textColor: '#FFFFFF',
      };
    }

    if (!isInternetReachable) {
      return {
        text: 'Limited Connectivity',
        icon: 'warning-outline' as const,
        backgroundColor: theme.colors.warning || '#FFA500',
        textColor: '#FFFFFF',
      };
    }

    return {
      text: `Connected${networkType ? ` via ${networkType}` : ''}`,
      icon: 'wifi' as const,
      backgroundColor: theme.colors.success,
      textColor: '#FFFFFF',
    };
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={config.icon}
          size={16}
          color={config.textColor}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: config.textColor }]}>
          {config.text}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 44, // Account for status bar
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
