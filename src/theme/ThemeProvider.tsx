import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setTheme } from '@/store/slices/appSlice';
import { Theme, ThemeMode, ThemeContextValue } from '@/types';
import { themes } from './themes';

// Create theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();

  // Get theme mode from Redux store
  const themeMode = useAppSelector(state => state.app.theme);

  // Determine current theme based on mode and system preference
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? themes.dark : themes.light;
    }
    return themes[themeMode];
  };

  const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme());
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  // Update theme when mode or system preference changes
  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
  }, [themeMode, systemColorScheme]);

  // Theme context value
  const contextValue: ThemeContextValue = {
    theme: currentTheme,
    themeMode,
    isDark,
    setThemeMode: (mode: ThemeMode) => {
      dispatch(setTheme(mode));
    },
    toggleTheme: () => {
      const newMode = themeMode === 'light' ? 'dark' : 'light';
      dispatch(setTheme(newMode));
    },
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Hook to get current theme object
export const useCurrentTheme = (): Theme => {
  const { theme } = useTheme();
  return theme;
};

// Hook to check if dark mode is active
export const useIsDark = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};
