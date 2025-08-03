// App constants and configuration
export const APP_CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  APP_NAME: 'Expo Mobile Skeleton',
  VERSION: '1.0.0',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME: '@theme',
  FIRST_LAUNCH: '@first_launch',
} as const;

// Export theme constants
export * from './theme';
