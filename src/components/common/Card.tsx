import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof Theme['spacing'] | number;
  margin?: keyof Theme['spacing'] | number;
  borderRadius?: keyof Theme['borderRadius'] | number;
  style?: ViewStyle;
  onPress?: TouchableOpacityProps['onPress'];
  disabled?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  margin,
  borderRadius = 'lg',
  style,
  onPress,
  disabled = false,
  testID,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const paddingValue =
    typeof padding === 'number' ? padding : theme.spacing[padding];
  const marginValue =
    typeof margin === 'number' ? margin : margin ? theme.spacing[margin] : 0;
  const borderRadiusValue =
    typeof borderRadius === 'number'
      ? borderRadius
      : theme.borderRadius[borderRadius];

  const cardStyle = [
    styles.card,
    styles[variant],
    {
      padding: paddingValue,
      margin: marginValue,
      borderRadius: borderRadiusValue,
    },
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole='button'
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

// Card Header component
export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.header, style]}>{children}</View>;
};

// Card Content component
export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.content, style]}>{children}</View>;
};

// Card Footer component
export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.footer, style]}>{children}</View>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
    },

    // Variants
    elevated: {
      ...theme.shadows.md,
      borderWidth: 0,
    },
    outlined: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 0,
    },

    // States
    disabled: {
      opacity: 0.6,
    },

    // Sub-components
    header: {
      marginBottom: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    footer: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
  });
