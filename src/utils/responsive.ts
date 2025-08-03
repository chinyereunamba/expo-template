import React from 'react';
import { Dimensions, PixelRatio } from 'react-native';
import { Theme } from '@/types';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for scaling (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale a value based on screen width
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale a value based on screen height
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size based on screen size and pixel density
 */
export const scaleFontSize = (size: number): number => {
  const scale = Math.min(
    SCREEN_WIDTH / BASE_WIDTH,
    SCREEN_HEIGHT / BASE_HEIGHT
  );
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (
  theme: Theme,
  size: keyof Theme['spacing']
): number => {
  const baseSpacing = theme.spacing[size];
  return scaleWidth(baseSpacing);
};

/**
 * Check if device is a tablet based on screen dimensions
 */
export const isTablet = (): boolean => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600 && aspectRatio < 1.6;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

/**
 * Get breakpoint based on screen width
 */
export const getBreakpoint = (theme: Theme): keyof Theme['breakpoints'] => {
  if (SCREEN_WIDTH >= theme.breakpoints.xl) return 'xl';
  if (SCREEN_WIDTH >= theme.breakpoints.lg) return 'lg';
  if (SCREEN_WIDTH >= theme.breakpoints.md) return 'md';
  return 'sm';
};

/**
 * Check if screen width matches or exceeds a breakpoint
 */
export const isBreakpoint = (
  theme: Theme,
  breakpoint: keyof Theme['breakpoints']
): boolean => {
  return SCREEN_WIDTH >= theme.breakpoints[breakpoint];
};

/**
 * Get responsive value based on breakpoints
 */
export const getResponsiveValue = <T>(
  theme: Theme,
  values: {
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }
): T => {
  const currentBreakpoint = getBreakpoint(theme);

  // Return the value for current breakpoint or fall back to smaller ones
  if (currentBreakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (currentBreakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (currentBreakpoint === 'md' && values.md !== undefined) return values.md;
  if (currentBreakpoint === 'sm' && values.sm !== undefined) return values.sm;

  return values.default;
};

/**
 * Create responsive styles object
 */
export const createResponsiveStyles = <T extends Record<string, any>>(
  theme: Theme,
  styleCreator: (
    breakpoint: keyof Theme['breakpoints'],
    dimensions: { width: number; height: number }
  ) => T
): T => {
  const currentBreakpoint = getBreakpoint(theme);
  const dimensions = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };

  return styleCreator(currentBreakpoint, dimensions);
};

/**
 * Hook for responsive dimensions (to be used with React hooks)
 */
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen'),
  });

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Responsive padding/margin utilities
 */
export const responsiveSpacing = {
  paddingHorizontal: (theme: Theme, size: keyof Theme['spacing']) => ({
    paddingHorizontal: getResponsiveSpacing(theme, size),
  }),
  paddingVertical: (theme: Theme, size: keyof Theme['spacing']) => ({
    paddingVertical: getResponsiveSpacing(theme, size),
  }),
  marginHorizontal: (theme: Theme, size: keyof Theme['spacing']) => ({
    marginHorizontal: getResponsiveSpacing(theme, size),
  }),
  marginVertical: (theme: Theme, size: keyof Theme['spacing']) => ({
    marginVertical: getResponsiveSpacing(theme, size),
  }),
};

/**
 * Device type detection
 */
export const deviceType = {
  isSmallPhone: SCREEN_WIDTH < 375,
  isPhone: SCREEN_WIDTH < 768,
  isTablet: isTablet(),
  isLargeTablet: SCREEN_WIDTH >= 1024,
};

/**
 * Safe area utilities for different device types
 */
export const getSafeAreaInsets = () => {
  // This is a basic implementation - in a real app you'd use react-native-safe-area-context
  const isIPhoneX = SCREEN_HEIGHT >= 812 && SCREEN_WIDTH >= 375;

  return {
    top: isIPhoneX ? 44 : 20,
    bottom: isIPhoneX ? 34 : 0,
    left: 0,
    right: 0,
  };
};
