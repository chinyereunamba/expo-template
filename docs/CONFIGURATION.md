# Configuration Guide

This document provides a comprehensive overview of the configuration system for the Expo Mobile Skeleton app.

## Overview

The app uses a multi-environment configuration system that supports:

- **Development**: Local development and testing
- **Staging**: Pre-production testing and QA
- **Production**: Live app store releases

## Configuration Files

### Environment Files

- `.env` - Development environment variables
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables
- `.env.example` - Template for environment variables

### Build Configuration

- `app.config.js` - Dynamic Expo configuration
- `eas.json` - EAS Build and Submit configuration
- `build-info.json` - Generated build metadata (auto-generated)

### Scripts

- `scripts/build-config.js` - Build configuration validation
- `scripts/setup-env.js` - Interactive environment setup

## Environment Variables

### Required Variables

All environments must define these variables:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false

# EAS Project Configuration
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id-here
```

### Optional Variables

```bash
# Analytics and Monitoring
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Configuration Usage

### In Code

Use the centralized configuration:

```typescript
import {
  config,
  API_CONFIG,
  APP_CONFIG,
  FEATURE_FLAGS,
} from '@/config/environment';

// Access environment-specific values
console.log('API URL:', API_CONFIG.BASE_URL);
console.log('App Environment:', APP_CONFIG.ENVIRONMENT);
console.log('Debug Mode:', APP_CONFIG.DEBUG);

// Use feature flags
if (FEATURE_FLAGS.ANALYTICS_ENABLED) {
  // Initialize analytics
}
```

### Environment Detection

```typescript
import { isDevelopment, isStaging, isProduction } from '@/config/environment';

if (isDevelopment) {
  // Development-only code
}

if (isProduction) {
  // Production-only code
}
```

## Build Profiles

### Development Profile

- **Purpose**: Development client for testing
- **Bundle ID**: `com.example.expomobileskeleton.dev`
- **Features**: Debug tools, development API
- **Updates**: Disabled

### Preview Profile (Staging)

- **Purpose**: Pre-production testing
- **Bundle ID**: `com.example.expomobileskeleton.staging`
- **Features**: Production-like, staging API
- **Updates**: Enabled with preview channel

### Production Profile

- **Purpose**: App store releases
- **Bundle ID**: `com.example.expomobileskeleton`
- **Features**: Optimized, production API
- **Updates**: Enabled with production channel

## Configuration Validation

### Validate Environment

```bash
# Validate specific environment
npm run config:validate development
npm run config:validate staging
npm run config:validate production

# List all environments
npm run config:list
```

### Setup New Environment

```bash
# Interactive setup
npm run setup:env
```

## Dynamic Configuration

The `app.config.js` file provides dynamic configuration based on environment variables:

### App Naming

- Development: "Expo Mobile Skeleton (Dev)"
- Staging: "Expo Mobile Skeleton (Staging)"
- Production: "Expo Mobile Skeleton"

### Bundle Identifiers

- Development: `com.example.expomobileskeleton.dev`
- Staging: `com.example.expomobileskeleton.staging`
- Production: `com.example.expomobileskeleton`

### Update Configuration

- Development: Updates disabled
- Staging: Updates enabled with preview channel
- Production: Updates enabled with production channel

## Security Best Practices

### Environment Variables

- Never commit sensitive keys to version control
- Use different API keys for each environment
- Rotate keys regularly
- Use EAS Secrets for build-time secrets

### Configuration Files

- Keep `.env` files in `.gitignore`
- Use `.env.example` as a template
- Document all required variables
- Validate configuration before builds

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```bash
   npm run config:validate production
   ```

2. **Wrong Environment Detected**
   - Check `EXPO_PUBLIC_APP_ENV` value
   - Verify environment file is loaded correctly
   - Clear Metro cache: `npx expo start --clear`

3. **Build Configuration Errors**
   - Validate EAS configuration: `eas build:configure`
   - Check app.config.js syntax
   - Verify all required variables are set

4. **Update Configuration Issues**
   - Check runtime version compatibility
   - Verify update channels match EAS configuration
   - Ensure code signing is configured

### Debug Configuration

```typescript
import { config } from '@/config/environment';

// Log current configuration (development only)
if (__DEV__) {
  console.log('Current Configuration:', {
    environment: config.APP_ENV,
    apiUrl: config.API_URL,
    debugMode: config.DEBUG_MODE,
    projectId: config.EAS_PROJECT_ID,
  });
}
```

## Migration Guide

### From Static to Dynamic Configuration

If migrating from static `app.json` to dynamic `app.config.js`:

1. Move configuration to `app.config.js`
2. Add environment variable support
3. Update build scripts to validate configuration
4. Test all build profiles
5. Update documentation

### Adding New Environments

1. Create new `.env.{environment}` file
2. Update `scripts/build-config.js` ENVIRONMENTS array
3. Add new EAS build profile
4. Update documentation
5. Test configuration validation

## Best Practices

### Configuration Management

- Use descriptive variable names
- Group related variables together
- Document all variables in `.env.example`
- Validate configuration in CI/CD

### Environment Separation

- Use different API endpoints for each environment
- Separate analytics and monitoring configurations
- Use environment-specific app icons/names
- Test configuration changes thoroughly

### Security

- Never log sensitive configuration in production
- Use secure storage for sensitive runtime data
- Implement proper error handling for missing config
- Regular security audits of configuration
