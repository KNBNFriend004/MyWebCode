import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';
import { loadTheme, saveTheme } from '../utils/storage';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  danger: string;
  border: string;
  inputBg: string;
  shadow: string;
  accent: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  danger: '#EF4444',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  shadow: '#00000015',
  accent: '#10B981',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  danger: '#F87171',
  border: '#334155',
  inputBg: '#0F172A',
  shadow: '#00000040',
  accent: '#34D399',
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme().then(setMode);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    saveTheme(newMode);
  };

  const colors = mode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
