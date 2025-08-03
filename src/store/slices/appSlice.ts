import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ThemeMode,
  AppState,
  SetNotificationPayload,
  SetAppSettingsPayload,
} from '../../types';

// Initial state
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

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Set theme mode
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },

    // Toggle theme
    toggleTheme: state => {
      // Cycle through: light -> dark -> system -> light
      if (state.theme === 'light') {
        state.theme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'system';
      } else {
        state.theme = 'light';
      }
    },

    // Set first launch flag
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },

    // Set notification settings
    setNotifications: (
      state,
      action: PayloadAction<SetNotificationPayload>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    // Set online status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Set app settings
    setAppSettings: (state, action: PayloadAction<SetAppSettingsPayload>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Set app version info
    setAppVersion: (
      state,
      action: PayloadAction<{ version: string; buildNumber: string }>
    ) => {
      state.appVersion = action.payload.version;
      state.buildNumber = action.payload.buildNumber;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// Export actions
export const {
  setTheme,
  toggleTheme,
  setFirstLaunch,
  setNotifications,
  setOnlineStatus,
  setAppSettings,
  setAppVersion,
} = appSlice.actions;

// Export reducer
export default appSlice.reducer;
