import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  ThemeMode,
  SetNotificationPayload,
  SetAppSettingsPayload,
} from '../types';
import { devtools, stateInspector } from '../utils/zustandDevtools';

interface AppStore extends AppState {
  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setFirstLaunch: (isFirstLaunch: boolean) => void;
  setNotifications: (payload: SetNotificationPayload) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setAppSettings: (payload: SetAppSettingsPayload) => void;
  setAppVersion: (version: { version: string; buildNumber: string }) => void;
}

const initialState: AppState = {
  theme: 'system',
  isFirstLaunch: true,
  notifications: {
    enabled: true,
    categories: {
      general: true,
      security: true,
      marketing: false,
      updates: true,
    },
    schedule: {
      startTime: '08:00',
      endTime: '22:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  },
  isOnline: true,
  appVersion: '1.0.0',
  buildNumber: '1',
  lastUpdated: null,
  settings: {
    language: 'en',
    region: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    biometricEnabled: false,
    autoLockTimeout: 5,
    crashReporting: true,
    analytics: true,
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    devtools(
      set => ({
        ...initialState,

        setTheme: (theme: ThemeMode) =>
          set({
            theme,
          }),

        toggleTheme: () =>
          set(state => {
            // Cycle through: light -> dark -> system -> light
            let newTheme: ThemeMode;
            if (state.theme === 'light') {
              newTheme = 'dark';
            } else if (state.theme === 'dark') {
              newTheme = 'system';
            } else {
              newTheme = 'light';
            }
            return { theme: newTheme };
          }),

        setFirstLaunch: (isFirstLaunch: boolean) =>
          set({
            isFirstLaunch,
          }),

        setNotifications: (payload: SetNotificationPayload) =>
          set(state => ({
            notifications: { ...state.notifications, ...payload },
          })),

        setOnlineStatus: (isOnline: boolean) =>
          set({
            isOnline,
          }),

        setAppSettings: (payload: SetAppSettingsPayload) =>
          set(state => ({
            settings: { ...state.settings, ...payload },
          })),

        setAppVersion: (version: { version: string; buildNumber: string }) =>
          set({
            appVersion: version.version,
            buildNumber: version.buildNumber,
            lastUpdated: new Date().toISOString(),
          }),
      }),
      'AppStore'
    ),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        theme: state.theme,
        isFirstLaunch: state.isFirstLaunch,
        notifications: state.notifications,
        settings: state.settings,
      }),
    }
  )
);
// Register store with state inspector
stateInspector.registerStore('AppStore', useAppStore);
