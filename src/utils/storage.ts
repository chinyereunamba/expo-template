import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

// Storage utility functions
export const StorageUtils = {
  // Generic storage methods
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Specific storage methods
  setAuthToken: (token: string) =>
    StorageUtils.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
  getAuthToken: () => StorageUtils.getItem<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeAuthToken: () => StorageUtils.removeItem(STORAGE_KEYS.AUTH_TOKEN),

  setUserData: (userData: any) =>
    StorageUtils.setItem(STORAGE_KEYS.USER_DATA, userData),
  getUserData: () => StorageUtils.getItem(STORAGE_KEYS.USER_DATA),
  removeUserData: () => StorageUtils.removeItem(STORAGE_KEYS.USER_DATA),

  setTheme: (theme: string) => StorageUtils.setItem(STORAGE_KEYS.THEME, theme),
  getTheme: () => StorageUtils.getItem<string>(STORAGE_KEYS.THEME),

  setFirstLaunch: (isFirst: boolean) =>
    StorageUtils.setItem(STORAGE_KEYS.FIRST_LAUNCH, isFirst),
  getFirstLaunch: () =>
    StorageUtils.getItem<boolean>(STORAGE_KEYS.FIRST_LAUNCH),
};
