import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null | undefined;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled';
  required?: boolean;
  disabled?: boolean;
  success?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'medium',
      variant = 'outlined',
      required = false,
      disabled = false,
      success = false,
      containerStyle,
      inputStyle,
      labelStyle,
      onRightIconPress,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const styles = createStyles(theme);

    const hasError = !!error;
    const showHelperText = !!(error || helperText);

    const containerStyles = [styles.container, containerStyle];

    const inputContainerStyles = [
      styles.inputContainer,
      styles[variant],
      styles[size],
      isFocused && styles.focused,
      hasError && styles.error,
      success && !hasError && styles.success,
      disabled && styles.disabled,
    ];

    const textInputStyles = [
      styles.input,
      styles[`${size}Input`],
      disabled && styles.disabledInput,
      inputStyle,
    ];

    const labelStyles = [
      styles.label,
      required && styles.requiredLabel,
      hasError && styles.errorLabel,
      disabled && styles.disabledLabel,
      labelStyle,
    ];

    return (
      <View style={containerStyles}>
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={styles.asterisk}> *</Text>}
          </Text>
        )}

        <View style={inputContainerStyles}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={textInputStyles}
            placeholderTextColor={theme.colors.placeholder}
            onFocus={e => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            editable={!disabled}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{ disabled }}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              accessibilityRole={onRightIconPress ? 'button' : undefined}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {showHelperText && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },

    label: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    requiredLabel: {
      // Base label style applies
    },
    errorLabel: {
      color: theme.colors.error,
    },
    disabledLabel: {
      color: theme.colors.textSecondary,
    },
    asterisk: {
      color: theme.colors.error,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
    },

    // Variants
    outlined: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: 'transparent',
    },

    // Sizes
    small: {
      minHeight: 36,
      paddingHorizontal: theme.spacing.sm,
    },
    medium: {
      minHeight: 44,
      paddingHorizontal: theme.spacing.md,
    },
    large: {
      minHeight: 52,
      paddingHorizontal: theme.spacing.lg,
    },

    // States
    focused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    error: {
      borderColor: theme.colors.error,
    },
    success: {
      borderColor: theme.colors.success,
    },
    disabled: {
      backgroundColor: theme.colors.disabled,
      borderColor: theme.colors.disabled,
    },

    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.normal,
    },
    smallInput: {
      fontSize: theme.typography.fontSizes.sm,
    },
    mediumInput: {
      fontSize: theme.typography.fontSizes.md,
    },
    largeInput: {
      fontSize: theme.typography.fontSizes.lg,
    },
    disabledInput: {
      color: theme.colors.textSecondary,
    },

    leftIconContainer: {
      marginRight: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightIconContainer: {
      marginLeft: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },

    helperText: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      color: theme.colors.error,
    },
  });
