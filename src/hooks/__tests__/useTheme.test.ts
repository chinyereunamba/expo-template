import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { lightTheme, darkTheme } from '@/theme/themes';

// Mock the theme context
const mockThemeContext = {
  theme: lightTheme,
  isDark: false,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

jest.mock('@/theme/ThemeProvider', () => ({
  __esModule: true,
  ...jest.requireActual('@/theme/ThemeProvider'),
  useTheme: () => mockThemeContext,
}));

describe('useTheme Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeContext.theme = lightTheme;
    mockThemeContext.isDark = false;
  });

  it('should return current theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe(lightTheme);
    expect(result.current.isDark).toBe(false);
  });

  it('should return dark theme when in dark mode', () => {
    mockThemeContext.theme = darkTheme;
    mockThemeContext.isDark = true;

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe(darkTheme);
    expect(result.current.isDark).toBe(true);
  });

  it('should provide theme colors', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.colors).toBe(lightTheme.colors);
    expect(result.current.colors.primary).toBeDefined();
    expect(result.current.colors.background).toBeDefined();
    expect(result.current.colors.text).toBeDefined();
  });

  it('should provide theme spacing', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.spacing).toBe(lightTheme.spacing);
    expect(result.current.spacing.xs).toBe(4);
    expect(result.current.spacing.sm).toBe(8);
    expect(result.current.spacing.md).toBe(16);
    expect(result.current.spacing.lg).toBe(24);
    expect(result.current.spacing.xl).toBe(32);
  });

  it('should provide theme typography', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.typography).toBe(lightTheme.typography);
    expect(result.current.typography.fontSizes).toBeDefined();
    expect(result.current.typography.fontWeights).toBeDefined();
  });

  it('should provide theme border radius', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.borderRadius).toBe(lightTheme.borderRadius);
    expect(result.current.borderRadius.sm).toBeDefined();
    expect(result.current.borderRadius.md).toBeDefined();
    expect(result.current.borderRadius.lg).toBeDefined();
  });

  it('should provide theme shadows', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.shadows).toBe(lightTheme.shadows);
    expect(result.current.shadows.sm).toBeDefined();
    expect(result.current.shadows.md).toBeDefined();
    expect(result.current.shadows.lg).toBeDefined();
  });

  it('should provide toggle theme function', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.toggleTheme).toBe(mockThemeContext.toggleTheme);
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('should provide set theme function', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.setTheme).toBe(mockThemeContext.setTheme);
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('should provide helper functions for theme-aware styling', () => {
    const { result } = renderHook(() => useTheme());

    // Test getColor helper
    expect(result.current.getColor('primary')).toBe(lightTheme.colors.primary);
    expect(result.current.getColor('background')).toBe(
      lightTheme.colors.background
    );

    // Test getSpacing helper
    expect(result.current.getSpacing('md')).toBe(lightTheme.spacing.md);
    expect(result.current.getSpacing('lg')).toBe(lightTheme.spacing.lg);

    // Test getFontSize helper
    expect(result.current.getFontSize('md')).toBe(
      lightTheme.typography.fontSizes.md
    );
    expect(result.current.getFontSize('lg')).toBe(
      lightTheme.typography.fontSizes.lg
    );
  });

  it('should handle invalid color keys gracefully', () => {
    const { result } = renderHook(() => useTheme());

    // Should return undefined or fallback for invalid keys
    expect(result.current.getColor('invalidColor' as any)).toBeUndefined();
  });

  it('should handle invalid spacing keys gracefully', () => {
    const { result } = renderHook(() => useTheme());

    // Should return undefined or fallback for invalid keys
    expect(result.current.getSpacing('invalidSpacing' as any)).toBeUndefined();
  });

  it('should handle invalid font size keys gracefully', () => {
    const { result } = renderHook(() => useTheme());

    // Should return undefined or fallback for invalid keys
    expect(result.current.getFontSize('invalidSize' as any)).toBeUndefined();
  });

  it('should provide createStyles helper function', () => {
    const { result } = renderHook(() => useTheme());

    const styles = result.current.createStyles(theme => ({
      container: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
      },
      text: {
        color: theme.colors.text,
        fontSize: theme.typography.fontSizes.md,
      },
    }));

    expect(styles.container.backgroundColor).toBe(lightTheme.colors.background);
    expect(styles.container.padding).toBe(lightTheme.spacing.md);
    expect(styles.text.color).toBe(lightTheme.colors.text);
    expect(styles.text.fontSize).toBe(lightTheme.typography.fontSizes.md);
  });

  it('should update styles when theme changes', () => {
    const { result, rerender } = renderHook(() => useTheme());

    // Initial light theme styles
    const lightStyles = result.current.createStyles(theme => ({
      container: {
        backgroundColor: theme.colors.background,
      },
    }));

    expect(lightStyles.container.backgroundColor).toBe(
      lightTheme.colors.background
    );

    // Change to dark theme
    mockThemeContext.theme = darkTheme;
    mockThemeContext.isDark = true;

    rerender();

    // Styles should update with dark theme
    const darkStyles = result.current.createStyles(theme => ({
      container: {
        backgroundColor: theme.colors.background,
      },
    }));

    expect(darkStyles.container.backgroundColor).toBe(
      darkTheme.colors.background
    );
    expect(darkStyles.container.backgroundColor).not.toBe(
      lightTheme.colors.background
    );
  });

  it('should provide isLight computed property', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isLight).toBe(true);

    // Change to dark theme
    mockThemeContext.isDark = true;
    const { result: darkResult } = renderHook(() => useTheme());

    expect(darkResult.current.isLight).toBe(false);
  });

  it('should provide theme mode string', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.mode).toBe('light');

    // Change to dark theme
    mockThemeContext.isDark = true;
    const { result: darkResult } = renderHook(() => useTheme());

    expect(darkResult.current.mode).toBe('dark');
  });

  it('should handle theme context not being available', () => {
    // Mock missing context
    jest.doMock('@/theme/ThemeProvider', () => ({
      useThemeContext: () => {
        throw new Error('useTheme must be used within a ThemeProvider');
      },
    }));

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });

  it('should provide responsive helpers', () => {
    const { result } = renderHook(() => useTheme());

    // Test responsive spacing
    const responsiveSpacing = result.current.getResponsiveSpacing('md', 'lg');
    expect(responsiveSpacing).toBeDefined();

    // Test responsive font size
    const responsiveFontSize = result.current.getResponsiveFontSize('sm', 'md');
    expect(responsiveFontSize).toBeDefined();
  });

  it('should provide elevation/shadow helpers', () => {
    const { result } = renderHook(() => useTheme());

    const elevation = result.current.getElevation(2);
    expect(elevation).toBeDefined();
    expect(elevation).toBe(lightTheme.shadows.md);
  });

  it('should provide color manipulation helpers', () => {
    const { result } = renderHook(() => useTheme());

    // Test color with opacity
    const colorWithOpacity = result.current.getColorWithOpacity('primary', 0.5);
    expect(colorWithOpacity).toBeDefined();
    expect(colorWithOpacity).toContain('rgba');

    // Test contrasting color
    const contrastColor = result.current.getContrastColor('primary');
    expect(contrastColor).toBeDefined();
  });
});
