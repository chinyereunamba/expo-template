// Theme-related constants
import { ThemeMode } from '@/types';

// Default theme settings
export const THEME_CONFIG = {
  DEFAULT_MODE: 'system' as ThemeMode,
  STORAGE_KEY: '@theme_mode',
  ANIMATION_DURATION: 200,
} as const;

// Theme transition settings
export const THEME_TRANSITIONS = {
  DURATION: 200,
  EASING: 'ease-in-out',
} as const;

// Accessibility settings
export const ACCESSIBILITY = {
  MIN_TOUCH_SIZE: 44, // Minimum touch target size in points
  FOCUS_RING_WIDTH: 2,
  HIGH_CONTRAST_RATIO: 4.5, // WCAG AA standard
} as const;

// Animation constants
export const ANIMATIONS = {
  SPRING: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  TIMING: {
    duration: 200,
    useNativeDriver: true,
  },
} as const;
