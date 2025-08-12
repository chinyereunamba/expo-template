/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  APP_ENV: Environment;
  API_URL: string;
  API_VERSION: string;
  DEBUG_MODE: boolean;
  ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
  EAS_PROJECT_ID: string;
}

const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_APP_ENV as Environment;
  return env || 'development';
};

const getConfig = (): EnvironmentConfig => {
  const environment = getEnvironment();

  return {
    APP_ENV: environment,
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    ANALYTICS_ID: process.env.EXPO_PUBLIC_ANALYTICS_ID,
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EAS_PROJECT_ID:
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-project-id-here',
  };
};

export const config = getConfig();

export const isDevelopment = config.APP_ENV === 'development';
export const isStaging = config.APP_ENV === 'staging';
export const isProduction = config.APP_ENV === 'production';

// API Configuration
export const API_CONFIG = {
  BASE_URL: config.API_URL,
  VERSION: config.API_VERSION,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: isProduction
    ? 'Expo Mobile Skeleton'
    : `Expo Mobile Skeleton (${config.APP_ENV})`,
  VERSION: '1.0.0',
  DEBUG: config.DEBUG_MODE,
  ENVIRONMENT: config.APP_ENV,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ANALYTICS_ENABLED: !!config.ANALYTICS_ID && isProduction,
  CRASH_REPORTING_ENABLED: !!config.SENTRY_DSN,
  DEV_TOOLS_ENABLED: isDevelopment,
  OTA_UPDATES_ENABLED: !isDevelopment,
} as const;

export default config;
