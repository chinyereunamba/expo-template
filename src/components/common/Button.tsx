import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const isDisabled = disabled || loading;

  const handlePress = (event: any) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  };

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole='button'
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {leftIcon && !loading && leftIcon}

      {loading ? (
        <ActivityIndicator
          size='small'
          color={
            variant === 'primary'
              ? theme.colors.textInverse
              : theme.colors.primary
          }
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}

      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: 'transparent',
      gap: theme.spacing.sm,
    },

    // Variants
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },

    // Sizes
    small: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: 44,
    },
    large: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      minHeight: 52,
    },

    // States
    disabled: {
      backgroundColor: theme.colors.disabled,
      borderColor: theme.colors.disabled,
    },
    fullWidth: {
      width: '100%',
    },

    // Text styles
    text: {
      fontWeight: theme.typography.fontWeights.medium,
      textAlign: 'center',
    },
    primaryText: {
      color: theme.colors.textInverse,
      fontSize: theme.typography.fontSizes.md,
    },
    secondaryText: {
      color: theme.colors.textInverse,
      fontSize: theme.typography.fontSizes.md,
    },
    outlineText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md,
    },
    ghostText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSizes.md,
    },

    // Size-specific text styles
    smallText: {
      fontSize: theme.typography.fontSizes.sm,
    },
    mediumText: {
      fontSize: theme.typography.fontSizes.md,
    },
    largeText: {
      fontSize: theme.typography.fontSizes.lg,
    },

    disabledText: {
      color: theme.colors.textSecondary,
    },
  });
