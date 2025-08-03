// Theme configurations for light and dark modes
import { Theme } from '@/types';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  breakpoints,
} from './tokens';

// Light theme configuration
export const lightTheme: Theme = {
  colors: {
    // Primary colors
    primary: colors.blue[600],
    primaryLight: colors.blue[400],
    primaryDark: colors.blue[800],
    secondary: colors.purple[600],
    secondaryLight: colors.purple[400],
    secondaryDark: colors.purple[800],

    // Background colors
    background: colors.white,
    backgroundSecondary: colors.gray[50],
    surface: colors.white,
    surfaceSecondary: colors.gray[100],
    card: colors.white,

    // Text colors
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    textTertiary: colors.gray[400],
    textInverse: colors.white,

    // Status colors
    error: colors.red[600],
    errorLight: colors.red[100],
    warning: colors.yellow[600],
    warningLight: colors.yellow[100],
    success: colors.green[600],
    successLight: colors.green[100],
    info: colors.blue[600],
    infoLight: colors.blue[100],

    // UI colors
    border: colors.gray[200],
    borderLight: colors.gray[100],
    divider: colors.gray[200],
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: colors.black,

    // Interactive colors
    link: colors.blue[600],
    linkVisited: colors.purple[600],
    focus: colors.blue[500],
    disabled: colors.gray[300],
    placeholder: colors.gray[400],
  },

  spacing,
  typography,
  borderRadius,
  shadows,
  breakpoints,
};

// Dark theme configuration
export const darkTheme: Theme = {
  colors: {
    // Primary colors
    primary: colors.blue[400],
    primaryLight: colors.blue[300],
    primaryDark: colors.blue[600],
    secondary: colors.purple[400],
    secondaryLight: colors.purple[300],
    secondaryDark: colors.purple[600],

    // Background colors
    background: colors.gray[900],
    backgroundSecondary: colors.gray[800],
    surface: colors.gray[800],
    surfaceSecondary: colors.gray[700],
    card: colors.gray[800],

    // Text colors
    text: colors.gray[100],
    textSecondary: colors.gray[300],
    textTertiary: colors.gray[500],
    textInverse: colors.gray[900],

    // Status colors
    error: colors.red[400],
    errorLight: colors.red[900],
    warning: colors.yellow[400],
    warningLight: colors.yellow[900],
    success: colors.green[400],
    successLight: colors.green[900],
    info: colors.blue[400],
    infoLight: colors.blue[900],

    // UI colors
    border: colors.gray[700],
    borderLight: colors.gray[600],
    divider: colors.gray[700],
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: colors.black,

    // Interactive colors
    link: colors.blue[400],
    linkVisited: colors.purple[400],
    focus: colors.blue[300],
    disabled: colors.gray[600],
    placeholder: colors.gray[500],
  },

  spacing,
  typography,
  borderRadius,

  // Adjust shadows for dark theme
  shadows: {
    sm: {
      ...shadows.sm,
      shadowOpacity: 0.3,
    },
    md: {
      ...shadows.md,
      shadowOpacity: 0.4,
    },
    lg: {
      ...shadows.lg,
      shadowOpacity: 0.5,
    },
  },

  breakpoints,
};

// Theme map for easy access
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
