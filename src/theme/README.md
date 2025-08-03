# Theme System

This theme system provides a comprehensive solution for managing design tokens, themes, and responsive styling in the Expo mobile app.

## Features

- 🎨 **Light and Dark Mode Support** - Automatic theme switching based on system preference
- 📱 **Responsive Design** - Breakpoint-based responsive utilities
- 🎯 **Type Safety** - Full TypeScript support for all theme properties
- 🔧 **Utility Functions** - Helper functions for common styling patterns
- 🎭 **Context-based** - React Context for theme state management
- 📦 **Design Tokens** - Centralized design system with consistent values

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@/theme';

export default function App() {
  return <ThemeProvider>{/* Your app content */}</ThemeProvider>;
}
```

### 2. Use theme hooks in components

```tsx
import { useTheme, useStyles } from '@/hooks';

const MyComponent = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  const styles = useStyles(theme => ({
    container: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    text: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSizes.md,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};
```

## Available Hooks

### `useTheme()`

Returns the complete theme context with utilities:

- `theme` - Current theme object
- `themeMode` - Current theme mode ('light', 'dark', 'system')
- `isDark` - Boolean indicating if dark mode is active
- `setThemeMode(mode)` - Function to set theme mode
- `toggleTheme()` - Function to toggle between themes

### `useCurrentTheme()`

Returns just the current theme object.

### `useColors()`

Returns the current theme's color palette.

### `useSpacing()`

Returns spacing utility functions (m, mt, p, px, etc.).

### `useTypography()`

Returns typography utility functions (text, weight, leading, etc.).

### `useResponsive()`

Returns responsive design utilities and screen size information.

### `useStyles(stylesFn)`

Creates theme-aware styles using a function that receives the current theme.

## Design Tokens

### Colors

- **Primary/Secondary** - Brand colors with light/dark variants
- **Background/Surface** - Layout background colors
- **Text** - Text colors with hierarchy (primary, secondary, tertiary)
- **Status** - Error, warning, success, info colors
- **UI** - Border, divider, overlay, shadow colors
- **Interactive** - Link, focus, disabled, placeholder colors

### Spacing

Consistent spacing scale: `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `xxl` (48px), `xxxl` (64px)

### Typography

- **Font Sizes** - xs to xxxl scale
- **Font Weights** - light to extrabold
- **Line Heights** - tight, normal, relaxed, loose
- **Letter Spacing** - tight, normal, wide, wider

### Border Radius

Scale from `none` (0px) to `full` (9999px) for rounded corners.

### Shadows

Three shadow levels: `sm`, `md`, `lg` with platform-appropriate styling.

## Responsive Design

The theme system includes breakpoint-based responsive utilities:

```tsx
const { getValue, createStyles, isSmall, isMedium, isLarge } = useResponsive();

// Get responsive values
const fontSize = getValue({
  sm: 14,
  md: 16,
  lg: 18,
  default: 16,
});

// Create responsive styles
const styles = createStyles((theme, screenSize) => ({
  container: {
    padding: screenSize === 'sm' ? theme.spacing.sm : theme.spacing.md,
  },
}));
```

## Utility Functions

### Spacing Utilities

```tsx
const spacing = useSpacing();

// Margin utilities
spacing.m('md'); // { margin: 16 }
spacing.mt('sm'); // { marginTop: 8 }
spacing.mx('lg'); // { marginLeft: 24, marginRight: 24 }

// Padding utilities
spacing.p('md'); // { padding: 16 }
spacing.py('sm'); // { paddingTop: 8, paddingBottom: 8 }
```

### Typography Utilities

```tsx
const typography = useTypography();

typography.text('lg'); // { fontSize: 18 }
typography.weight('bold'); // { fontWeight: '700' }
typography.leading('relaxed'); // { lineHeight: 25.6 }
```

## Theme Modes

The system supports three theme modes:

1. **Light** - Always use light theme
2. **Dark** - Always use dark theme
3. **System** - Follow system preference (default)

Theme mode is persisted in Redux store and automatically restored on app restart.

## Customization

### Adding New Colors

Edit `src/theme/tokens.ts` to add new color values:

```tsx
export const colors = {
  // ... existing colors
  brand: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
};
```

Then update theme configurations in `src/theme/themes.ts`:

```tsx
export const lightTheme: Theme = {
  colors: {
    // ... existing colors
    brand: colors.brand[500],
  },
  // ...
};
```

### Creating Custom Themes

You can create additional theme variants by extending the base theme structure and adding them to the themes object.

## Best Practices

1. **Use theme hooks** instead of importing theme objects directly
2. **Prefer utility functions** over manual style calculations
3. **Use responsive utilities** for different screen sizes
4. **Follow the design token system** for consistency
5. **Test both light and dark modes** during development
6. **Use semantic color names** (e.g., 'error' instead of 'red')
