// Theme system tests
import { lightTheme, darkTheme, themes } from '../themes';
import { colors } from '../tokens';

describe('Theme System', () => {
  describe('Light Theme', () => {
    it('should have all required color properties', () => {
      expect(lightTheme.colors).toHaveProperty('primary');
      expect(lightTheme.colors).toHaveProperty('secondary');
      expect(lightTheme.colors).toHaveProperty('background');
      expect(lightTheme.colors).toHaveProperty('surface');
      expect(lightTheme.colors).toHaveProperty('text');
      expect(lightTheme.colors).toHaveProperty('error');
      expect(lightTheme.colors).toHaveProperty('warning');
      expect(lightTheme.colors).toHaveProperty('success');
      expect(lightTheme.colors).toHaveProperty('info');
    });

    it('should have proper spacing scale', () => {
      expect(lightTheme.spacing.xs).toBe(4);
      expect(lightTheme.spacing.sm).toBe(8);
      expect(lightTheme.spacing.md).toBe(16);
      expect(lightTheme.spacing.lg).toBe(24);
      expect(lightTheme.spacing.xl).toBe(32);
    });

    it('should have typography configuration', () => {
      expect(lightTheme.typography.fontSizes).toHaveProperty('xs');
      expect(lightTheme.typography.fontSizes).toHaveProperty('md');
      expect(lightTheme.typography.fontSizes).toHaveProperty('xl');
      expect(lightTheme.typography.fontWeights).toHaveProperty('normal');
      expect(lightTheme.typography.fontWeights).toHaveProperty('bold');
    });
  });

  describe('Dark Theme', () => {
    it('should have all required color properties', () => {
      expect(darkTheme.colors).toHaveProperty('primary');
      expect(darkTheme.colors).toHaveProperty('secondary');
      expect(darkTheme.colors).toHaveProperty('background');
      expect(darkTheme.colors).toHaveProperty('surface');
      expect(darkTheme.colors).toHaveProperty('text');
    });

    it('should have different background colors than light theme', () => {
      expect(darkTheme.colors.background).not.toBe(
        lightTheme.colors.background
      );
      expect(darkTheme.colors.surface).not.toBe(lightTheme.colors.surface);
      expect(darkTheme.colors.text).not.toBe(lightTheme.colors.text);
    });

    it('should have same spacing and typography as light theme', () => {
      expect(darkTheme.spacing).toEqual(lightTheme.spacing);
      expect(darkTheme.typography).toEqual(lightTheme.typography);
      expect(darkTheme.borderRadius).toEqual(lightTheme.borderRadius);
    });
  });

  describe('Themes Object', () => {
    it('should export both light and dark themes', () => {
      expect(themes).toHaveProperty('light');
      expect(themes).toHaveProperty('dark');
      expect(themes.light).toBe(lightTheme);
      expect(themes.dark).toBe(darkTheme);
    });
  });

  describe('Design Tokens', () => {
    it('should have consistent color palette', () => {
      expect(colors.blue).toHaveProperty('500');
      expect(colors.gray).toHaveProperty('900');
      expect(colors.red).toHaveProperty('600');
      expect(colors.green).toHaveProperty('500');
    });

    it('should have white and black constants', () => {
      expect(colors.white).toBe('#ffffff');
      expect(colors.black).toBe('#000000');
      expect(colors.transparent).toBe('transparent');
    });
  });
});
