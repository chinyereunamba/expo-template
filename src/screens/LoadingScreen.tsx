import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator
        size='large'
        color={theme.colors.primary}
        style={styles.spinner}
      />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Loading...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
