# Build and Deployment Guide

This guide covers the build and deployment process for the Expo Mobile Skeleton app across different environments.

## Environment Configuration

The app supports three environments:

- **Development**: Local development and testing
- **Staging**: Pre-production testing and QA
- **Production**: Live app store releases

### Environment Files

Each environment has its own configuration file:

- `.env` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Required Environment Variables

All environment files must include:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false

# EAS Project Configuration
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id-here

# Optional: Analytics and Monitoring
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Build Profiles

### Development Build

- **Profile**: `development`
- **Purpose**: Development client for testing
- **Distribution**: Internal only
- **Features**: Debug mode, development tools enabled

```bash
npm run build:dev
```

### Staging Build

- **Profile**: `preview`
- **Purpose**: Pre-production testing
- **Distribution**: Internal testing
- **Features**: Production-like but with staging API

```bash
npm run build:staging
```

### Production Build

- **Profile**: `production`
- **Purpose**: App store releases
- **Distribution**: App stores
- **Features**: Optimized, analytics enabled

```bash
npm run build:prod
```

## Build Commands

### Validate Configuration

Before building, validate your environment configuration:

```bash
# Validate specific environment
npm run config:validate development
npm run config:validate staging
npm run config:validate production

# List all environments
npm run config:list
```

### Platform-Specific Builds

```bash
# Build for specific platforms
eas build --platform android --profile production
eas build --platform ios --profile production
eas build --platform all --profile production

# Or use npm scripts
npm run build:android
npm run build:ios
npm run build:all
```

### Build with Auto-Increment

Production builds automatically increment version numbers:

```bash
npm run build:prod
```

## Over-the-Air Updates

### Update Channels

- **development**: Development updates
- **preview**: Staging updates
- **production**: Production updates

### Publishing Updates

```bash
# Publish to specific channels
npm run update:dev
npm run update:staging
npm run update:prod

# Or use EAS directly
eas update --channel production --message "Bug fixes and improvements"
```

### Update Configuration

Updates are configured in `app.config.js`:

- **Enabled**: Disabled for development, enabled for staging/production
- **Check**: Automatically on app load
- **Fallback**: 30 second timeout to cached version

## App Store Submission

### Prerequisites

1. Valid Apple Developer account (iOS)
2. Google Play Console account (Android)
3. App store certificates and provisioning profiles
4. Service account key for Android (optional)

### Submission Commands

```bash
# Submit to app stores
npm run submit:prod

# Platform-specific submission
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Submission Configuration

Configure in `eas.json` under the `submit` section:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-asc-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## Asset Management

### App Icons

- **iOS**: `assets/icons/icon.png` (1024x1024)
- **Android**: `assets/icons/adaptive-icon.png` (1024x1024)
- **Web**: `assets/icons/favicon.png` (48x48)

### Splash Screen

- **Image**: `assets/splash/splash-icon.png`
- **Background**: White (#ffffff)
- **Resize Mode**: Contain

### Icon Guidelines

- Use PNG format
- Maintain consistent branding across platforms
- Follow platform-specific design guidelines
- Test on different device sizes

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```bash
   npm run config:validate production
   ```

2. **Build Failures**
   - Check EAS build logs
   - Verify all dependencies are compatible
   - Ensure certificates are valid

3. **Update Failures**
   - Verify runtime version compatibility
   - Check update channel configuration
   - Ensure code signing is properly configured

4. **Submission Issues**
   - Verify app store credentials
   - Check app metadata and screenshots
   - Ensure compliance with store policies

### Getting Help

- Check EAS Build logs: `eas build:list`
- View update history: `eas update:list`
- EAS Documentation: https://docs.expo.dev/eas/
- Expo Forums: https://forums.expo.dev/

## Security Considerations

### Environment Variables

- Never commit sensitive keys to version control
- Use EAS Secrets for sensitive build-time variables
- Rotate API keys regularly

### Code Signing

- Store certificates securely
- Use EAS managed certificates when possible
- Keep provisioning profiles up to date

### App Store Security

- Enable app transport security
- Use certificate pinning for API calls
- Implement proper authentication flows

## Monitoring and Analytics

### Build Monitoring

- Monitor build success rates
- Track build times and performance
- Set up alerts for build failures

### App Performance

- Monitor crash rates and errors
- Track app performance metrics
- Use analytics to understand user behavior

### Update Monitoring

- Track update adoption rates
- Monitor for update-related crashes
- A/B test new features with updates
