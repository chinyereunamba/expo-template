// Custom hooks for theme usage
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useCurrentTheme } from '@/theme/ThemeProvider';
import {
  createSpacing,
  createTypography,
  createResponsiveStyles,
  getResponsiveValue,
} from '@/theme/utils';
import { Theme } from '@/types';

// Re-export theme hooks from ThemeProvider
export { useTheme, useCurrentTheme, useIsDark } from '@/theme/ThemeProvider';

// Hook for spacing utilities
export const useSpacing = () => {
  const theme = useCurrentTheme();

  return useMemo(() => createSpacing(theme), [theme]);
};

// Hook for typography utilities
export const useTypography = () => {
  const theme = useCurrentTheme();

  return useMemo(() => createTypography(theme), [theme]);
};

// Hook for responsive design
export const useResponsive = () => {
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      isSmall: width < theme.breakpoints.sm,
      isMedium: width >= theme.breakpoints.sm && width < theme.breakpoints.md,
      isLarge: width >= theme.breakpoints.md,

      // Get responsive value
      getValue: <T>(values: { sm?: T; md?: T; lg?: T; default: T }) =>
        getResponsiveValue(width, theme, values),

      // Create responsive styles
      createStyles: <T extends Record<string, any>>(
        stylesFn: (theme: Theme, screenSize: 'sm' | 'md' | 'lg') => T
      ) => createResponsiveStyles(width, theme, stylesFn),
    }),
    [theme, width]
  );
};

// Hook for theme-aware colors
export const useColors = () => {
  const theme = useCurrentTheme();

  return useMemo(() => theme.colors, [theme]);
};

// Hook for creating theme-aware styles
export const useStyles = <T extends Record<string, any>>(
  stylesFn: (theme: Theme) => T
) => {
  const theme = useCurrentTheme();

  return useMemo(() => stylesFn(theme), [theme, stylesFn]);
};
