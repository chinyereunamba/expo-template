import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';
import { LoadingOverlay } from './Loading';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  backgroundColor?: string;
  padding?: keyof Theme['spacing'] | number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  loading?: boolean;
  loadingText?: string;
  testID?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  statusBarStyle,
  backgroundColor,
  padding = 'md',
  style,
  contentContainerStyle,
  loading = false,
  loadingText,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  // Determine status bar style based on theme if not provided
  const statusStyle =
    statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  const paddingValue =
    typeof padding === 'number' ? padding : theme.spacing[padding];
  const bgColor = backgroundColor || theme.colors.background;

  const containerStyle = [
    styles.container,
    { backgroundColor: bgColor, padding: paddingValue },
    style,
  ];

  const content = (
    <>
      <StatusBar
        barStyle={statusStyle}
        backgroundColor={Platform.OS === 'android' ? bgColor : undefined}
        translucent={Platform.OS === 'android'}
      />

      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )}

      <LoadingOverlay visible={loading} text={loadingText} />
    </>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} testID={testID}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
};

// Header component for screens
export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: ViewStyle;
  subtitleStyle?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>{leftComponent}</View>

      <View style={styles.headerCenter}>
        {title && <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>}
        {subtitle && (
          <Text style={[styles.headerSubtitle, subtitleStyle]}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.headerRight}>{rightComponent}</View>
    </View>
  );
};

// Container component for consistent spacing
export interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof Theme['spacing'] | number;
  margin?: keyof Theme['spacing'] | number;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'md',
  margin,
  style,
}) => {
  const { theme } = useTheme();

  const paddingValue =
    typeof padding === 'number' ? padding : theme.spacing[padding];
  const marginValue =
    typeof margin === 'number' ? margin : margin ? theme.spacing[margin] : 0;

  const containerStyle = [
    {
      padding: paddingValue,
      margin: marginValue,
    },
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flex: 1,
    },

    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },

    headerCenter: {
      alignItems: 'center',
      flex: 2,
    },

    headerLeft: {
      alignItems: 'flex-start',
      flex: 1,
    },

    headerRight: {
      alignItems: 'flex-end',
      flex: 1,
    },

    headerSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSizes.sm,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },

    headerTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.xl,
      fontWeight: theme.typography.fontWeights.bold,
      textAlign: 'center',
    },

    scrollContent: {
      flexGrow: 1,
    },

    scrollView: {
      flex: 1,
    },
  });
