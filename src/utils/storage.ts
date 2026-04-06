import AsyncStorage from '@react-native-async-storage/async-storage';
import { Folder, ThemeMode } from '../types';

const FOLDERS_KEY = '@notes_manager_folders';
const THEME_KEY = '@notes_manager_theme';

export const loadFolders = async (): Promise<Folder[]> => {
  try {
    const data = await AsyncStorage.getItem(FOLDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveFolders = async (folders: Folder[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {
    console.error('Failed to save folders');
  }
};

export const loadTheme = async (): Promise<ThemeMode> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return (theme as ThemeMode) || 'light';
  } catch {
    return 'light';
  }
};

export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch {
    console.error('Failed to save theme');
  }
};
