import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';

export interface LoadingProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  style,
  textStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const indicatorColor = color || theme.colors.primary;

  const containerStyle = [styles.container, overlay && styles.overlay, style];

  const textStyles = [styles.text, textStyle];

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator
        size={size}
        color={indicatorColor}
        accessibilityLabel='Loading'
      />
      {text && (
        <Text style={textStyles} accessibilityLabel={text}>
          {text}
        </Text>
      )}
    </View>
  );
};

// Inline loading component for buttons or small spaces
export interface InlineLoadingProps {
  size?: 'small' | number;
  color?: string;
  style?: ViewStyle;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'small',
  color,
  style,
}) => {
  const { theme } = useTheme();
  const indicatorColor = color || theme.colors.primary;

  return <ActivityIndicator size={size} color={indicatorColor} style={style} />;
};

// Full screen loading overlay
export interface LoadingOverlayProps {
  visible: boolean;
  text?: string | undefined;
  backgroundColor?: string;
  opacity?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = 'Loading...',
  backgroundColor,
  opacity = 0.8,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!visible) return null;

  const overlayStyle = [
    styles.fullScreenOverlay,
    {
      backgroundColor: backgroundColor || theme.colors.overlay,
      opacity,
    },
  ];

  return (
    <View style={overlayStyle}>
      <View style={styles.overlayContent}>
        <Loading
          size='large'
          text={text}
          color={theme.colors.textInverse}
          textStyle={{ color: theme.colors.textInverse }}
        />
      </View>
    </View>
  );
};

// Skeleton loading component for content placeholders
export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const skeletonStyle = {
    ...styles.skeleton,
    width,
    height,
    borderRadius,
    ...style,
  };

  return <View style={skeletonStyle} />;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
    },

    fullScreenOverlay: {
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 9999,
    },

    overlay: {
      backgroundColor: theme.colors.overlay,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },

    overlayContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.lg,
      alignItems: 'center',
      minWidth: 120,
    },

    skeleton: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.7,
    },

    text: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md,
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
  });
