// src/components/dark-mode/DarkModeController.ts
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export const useDarkMode = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  // Only show theme UI when mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // If not mounted, return default/neutral values
  if (!mounted) {
    return {
      toggleTheme: () => {},
      isDark: false,
      currentTheme: 'light',
      mounted
    };
  }

  return {
    toggleTheme,
    isDark: theme === 'dark',
    currentTheme: theme,
    mounted
  };
};