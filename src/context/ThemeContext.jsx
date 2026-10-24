import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightPalette, darkPalette, spacing, radius, typography } from '../theme/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Read saved theme preference if available
  useEffect(() => {
    AsyncStorage.getItem('dastaan_theme')
      .then(savedTheme => {
        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('dastaan_theme', next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? darkPalette : lightPalette,
    spacing,
    radius,
    typography
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom consumer hook with descriptive error guard (A1 Q6 Requirement 2)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
