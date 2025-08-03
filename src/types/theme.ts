// Theme type definitions
export interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;

    // Background colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceSecondary: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Status colors
    error: string;
    errorLight: string;
    warning: string;
    warningLight: string;
    success: string;
    successLight: string;
    info: string;
    infoLight: string;

    // UI colors
    border: string;
    borderLight: string;
    divider: string;
    overlay: string;
    shadow: string;

    // Interactive colors
    link: string;
    linkVisited: string;
    focus: string;
    disabled: string;
    placeholder: string;
  };

  spacing: {
    xs: number; // 4
    sm: number; // 8
    md: number; // 16
    lg: number; // 24
    xl: number; // 32
    xxl: number; // 48
    xxxl: number; // 64
  };

  typography: {
    fontSizes: {
      xs: number; // 12
      sm: number; // 14
      md: number; // 16
      lg: number; // 18
      xl: number; // 20
      xxl: number; // 24
      xxxl: number; // 32
    };

    fontWeights: {
      light: '300';
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
      extrabold: '800';
    };

    lineHeights: {
      tight: number; // 1.2
      normal: number; // 1.4
      relaxed: number; // 1.6
      loose: number; // 1.8
    };

    letterSpacing: {
      tight: number; // -0.5
      normal: number; // 0
      wide: number; // 0.5
      wider: number; // 1
    };
  };

  borderRadius: {
    none: number; // 0
    sm: number; // 4
    md: number; // 8
    lg: number; // 12
    xl: number; // 16
    xxl: number; // 24
    full: number; // 9999
  };

  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };

  breakpoints: {
    sm: number; // 480
    md: number; // 768
    lg: number; // 1024
    xl: number; // 1280
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Component style props that can use theme values
export interface ThemeStyleProps {
  color?: keyof Theme['colors'];
  backgroundColor?: keyof Theme['colors'];
  borderColor?: keyof Theme['colors'];
  fontSize?: keyof Theme['typography']['fontSizes'];
  fontWeight?: keyof Theme['typography']['fontWeights'];
  spacing?: keyof Theme['spacing'];
  borderRadius?: keyof Theme['borderRadius'];
  shadow?: keyof Theme['shadows'];
}
