// Example component demonstrating theme usage
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  useTheme,
  useStyles,
  useSpacing,
  useTypography,
  useColors,
} from '@/hooks';

interface ThemeExampleProps {
  title?: string;
}

export const ThemeExample: React.FC<ThemeExampleProps> = ({
  title = 'Theme Example',
}) => {
  const { toggleTheme, isDark } = useTheme();
  const spacing = useSpacing();
  const typography = useTypography();
  const colors = useColors();

  const styles = useStyles(theme =>
    StyleSheet.create({
      container: {
        ...spacing.p('md'),
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.md,
      },
      title: {
        ...typography.text('xl'),
        ...typography.weight('bold'),
        color: theme.colors.text,
        ...spacing.mb('sm'),
      },
      description: {
        ...typography.text('md'),
        color: theme.colors.textSecondary,
        lineHeight:
          theme.typography.lineHeights.relaxed * theme.typography.fontSizes.md,
        ...spacing.mb('lg'),
      },
      button: {
        backgroundColor: theme.colors.primary,
        ...spacing.py('sm'),
        ...spacing.px('md'),
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
      },
      buttonText: {
        ...typography.text('md'),
        ...typography.weight('semibold'),
        color: theme.colors.textInverse,
      },
      statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...spacing.mt('md'),
        ...spacing.p('sm'),
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.sm,
      },
      statusText: {
        ...typography.text('sm'),
        color: theme.colors.textSecondary,
      },
      modeText: {
        ...typography.text('sm'),
        ...typography.weight('medium'),
        color: isDark ? colors.warning : colors.info,
      },
    })
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>
        This component demonstrates the theme system in action. It uses
        theme-aware colors, spacing, typography, and responds to theme changes
        automatically.
      </Text>

      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Current theme:</Text>
        <Text style={styles.modeText}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </View>
    </View>
  );
};
