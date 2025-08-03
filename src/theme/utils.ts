// Theme utility functions for styling
import { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { Theme, ThemeStyleProps } from '@/types';

// Type for style objects
type Style = ViewStyle | TextStyle | ImageStyle;
type StyleObject = { [key: string]: Style };

// Create theme-aware styles
export const createStyles = <T extends StyleObject>(
  stylesFn: (theme: Theme) => T
) => {
  return (theme: Theme): T => stylesFn(theme);
};

// Get color value from theme
export const getColor = (
  theme: Theme,
  colorKey: keyof Theme['colors']
): string => {
  return theme.colors[colorKey];
};

// Get spacing value from theme
export const getSpacing = (
  theme: Theme,
  spacingKey: keyof Theme['spacing']
): number => {
  return theme.spacing[spacingKey];
};

// Get font size from theme
export const getFontSize = (
  theme: Theme,
  sizeKey: keyof Theme['typography']['fontSizes']
): number => {
  return theme.typography.fontSizes[sizeKey];
};

// Get font weight from theme
export const getFontWeight = (
  theme: Theme,
  weightKey: keyof Theme['typography']['fontWeights']
): string => {
  return theme.typography.fontWeights[weightKey];
};

// Get border radius from theme
export const getBorderRadius = (
  theme: Theme,
  radiusKey: keyof Theme['borderRadius']
): number => {
  return theme.borderRadius[radiusKey];
};

// Get shadow from theme
export const getShadow = (theme: Theme, shadowKey: keyof Theme['shadows']) => {
  return theme.shadows[shadowKey];
};

// Apply theme-aware style props to a style object
export const applyThemeProps = (
  theme: Theme,
  props: ThemeStyleProps
): Style => {
  const style: Style = {};

  if (props.color) {
    (style as TextStyle).color = getColor(theme, props.color);
  }

  if (props.backgroundColor) {
    (style as ViewStyle).backgroundColor = getColor(
      theme,
      props.backgroundColor
    );
  }

  if (props.borderColor) {
    (style as ViewStyle).borderColor = getColor(theme, props.borderColor);
  }

  if (props.fontSize) {
    (style as TextStyle).fontSize = getFontSize(theme, props.fontSize);
  }

  if (props.fontWeight) {
    (style as TextStyle).fontWeight = getFontWeight(
      theme,
      props.fontWeight
    ) as any;
  }

  if (props.borderRadius) {
    (style as ViewStyle).borderRadius = getBorderRadius(
      theme,
      props.borderRadius
    );
  }

  if (props.shadow) {
    const shadowStyle = getShadow(theme, props.shadow);
    Object.assign(style, shadowStyle);
  }

  if (props.spacing) {
    const spacingValue = getSpacing(theme, props.spacing);
    (style as ViewStyle).padding = spacingValue;
  }

  return style;
};

// Responsive design utilities
export const isSmallScreen = (width: number, theme: Theme): boolean => {
  return width < theme.breakpoints.sm;
};

export const isMediumScreen = (width: number, theme: Theme): boolean => {
  return width >= theme.breakpoints.sm && width < theme.breakpoints.md;
};

export const isLargeScreen = (width: number, theme: Theme): boolean => {
  return width >= theme.breakpoints.md;
};

// Get responsive value based on screen size
export const getResponsiveValue = <T>(
  width: number,
  theme: Theme,
  values: {
    sm?: T;
    md?: T;
    lg?: T;
    default: T;
  }
): T => {
  if (isLargeScreen(width, theme) && values.lg !== undefined) {
    return values.lg;
  }

  if (isMediumScreen(width, theme) && values.md !== undefined) {
    return values.md;
  }

  if (isSmallScreen(width, theme) && values.sm !== undefined) {
    return values.sm;
  }

  return values.default;
};

// Create responsive styles
export const createResponsiveStyles = <T extends StyleObject>(
  width: number,
  theme: Theme,
  stylesFn: (theme: Theme, screenSize: 'sm' | 'md' | 'lg') => T
): T => {
  let screenSize: 'sm' | 'md' | 'lg' = 'sm';

  if (isLargeScreen(width, theme)) {
    screenSize = 'lg';
  } else if (isMediumScreen(width, theme)) {
    screenSize = 'md';
  }

  return stylesFn(theme, screenSize);
};

// Interpolate between two values based on a factor (0-1)
export const interpolate = (
  start: number,
  end: number,
  factor: number
): number => {
  return start + (end - start) * Math.max(0, Math.min(1, factor));
};

// Create animated color transitions
export const interpolateColor = (
  startColor: string,
  endColor: string,
  factor: number
): string => {
  // Simple color interpolation (works with hex colors)
  // For more complex color interpolation, consider using a library like chroma-js
  if (factor <= 0) return startColor;
  if (factor >= 1) return endColor;

  // This is a simplified implementation
  // In a real app, you might want to use a more sophisticated color interpolation
  return factor < 0.5 ? startColor : endColor;
};

// Helper to create consistent component spacing
export const createSpacing = (theme: Theme) => ({
  // Margin utilities
  m: (size: keyof Theme['spacing']) => ({ margin: theme.spacing[size] }),
  mt: (size: keyof Theme['spacing']) => ({ marginTop: theme.spacing[size] }),
  mr: (size: keyof Theme['spacing']) => ({ marginRight: theme.spacing[size] }),
  mb: (size: keyof Theme['spacing']) => ({ marginBottom: theme.spacing[size] }),
  ml: (size: keyof Theme['spacing']) => ({ marginLeft: theme.spacing[size] }),
  mx: (size: keyof Theme['spacing']) => ({
    marginLeft: theme.spacing[size],
    marginRight: theme.spacing[size],
  }),
  my: (size: keyof Theme['spacing']) => ({
    marginTop: theme.spacing[size],
    marginBottom: theme.spacing[size],
  }),

  // Padding utilities
  p: (size: keyof Theme['spacing']) => ({ padding: theme.spacing[size] }),
  pt: (size: keyof Theme['spacing']) => ({ paddingTop: theme.spacing[size] }),
  pr: (size: keyof Theme['spacing']) => ({ paddingRight: theme.spacing[size] }),
  pb: (size: keyof Theme['spacing']) => ({
    paddingBottom: theme.spacing[size],
  }),
  pl: (size: keyof Theme['spacing']) => ({ paddingLeft: theme.spacing[size] }),
  px: (size: keyof Theme['spacing']) => ({
    paddingLeft: theme.spacing[size],
    paddingRight: theme.spacing[size],
  }),
  py: (size: keyof Theme['spacing']) => ({
    paddingTop: theme.spacing[size],
    paddingBottom: theme.spacing[size],
  }),
});

// Helper to create consistent typography styles
export const createTypography = (theme: Theme) => ({
  // Text size utilities
  text: (size: keyof Theme['typography']['fontSizes']) => ({
    fontSize: theme.typography.fontSizes[size],
  }),

  // Font weight utilities
  weight: (weight: keyof Theme['typography']['fontWeights']) => ({
    fontWeight: theme.typography.fontWeights[weight],
  }),

  // Line height utilities
  leading: (height: keyof Theme['typography']['lineHeights']) => ({
    lineHeight:
      theme.typography.lineHeights[height] * theme.typography.fontSizes.md,
  }),

  // Letter spacing utilities
  tracking: (spacing: keyof Theme['typography']['letterSpacing']) => ({
    letterSpacing: theme.typography.letterSpacing[spacing],
  }),
});
