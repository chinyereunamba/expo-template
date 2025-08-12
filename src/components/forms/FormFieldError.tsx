import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface FormFieldErrorProps {
  error?: string;
  visible?: boolean;
  animated?: boolean;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  visible = true,
  animated = true,
}) => {
  const { theme } = useTheme();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: error && visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error, visible, animated, fadeAnim]);

  if (!error || !visible) {
    return null;
  }

  const ErrorContent = (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.errorBackground },
      ]}
    >
      <Ionicons
        name='alert-circle-outline'
        size={16}
        color={theme.colors.error}
        style={styles.icon}
      />
      <Text style={[styles.errorText, { color: theme.colors.error }]}>
        {error}
      </Text>
    </View>
  );

  if (animated) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        {ErrorContent}
      </Animated.View>
    );
  }

  return ErrorContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  icon: {
    marginRight: 8,
  },
});
