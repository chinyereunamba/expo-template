# Expo Mobile Skeleton

A scalable mobile app skeleton built with Expo React Native and TypeScript.

## Features

- 🚀 Expo SDK 50+ with TypeScript
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 Structured component architecture
- 🧭 Navigation ready (React Navigation)
- 🔧 Development tools configured (ESLint, Prettier, Husky)
- 📦 State management ready
- 🎯 Path aliases configured
- 🧪 Testing setup with Jest

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   └── forms/          # Form-specific components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── home/          # Home/dashboard screens
│   └── profile/       # User profile screens
├── navigation/         # Navigation configuration
├── services/          # API and external service integrations
├── store/             # State management
│   ├── slices/        # Redux slices
│   └── api/           # RTK Query API definitions
├── utils/             # Utility functions and helpers
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── constants/         # App constants and configuration
└── assets/            # Images, fonts, and other static assets
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## Development Scripts

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Build & Deploy

### Environment Setup

Set up your environment configuration:

```bash
# Interactive setup
npm run setup:env

# Or manually copy and edit
cp .env.example .env
```

### Build Commands

```bash
# Development builds
npm run build:dev

# Staging builds
npm run build:staging

# Production builds
npm run build:prod

# Platform-specific builds
npm run build:android
npm run build:ios
npm run build:all
```

### Configuration Validation

```bash
# Validate environment configuration
npm run config:validate development
npm run config:validate staging
npm run config:validate production

# List all environments
npm run config:list
```

### Over-the-Air Updates

```bash
# Publish updates to different channels
npm run update:dev
npm run update:staging
npm run update:prod
```

### App Store Submission

```bash
# Submit to app stores
npm run submit:staging  # Internal testing
npm run submit:prod     # Production release
```

## Environment Configuration

The app supports multiple environments with different configurations:

- **Development**: Local development with debug tools
- **Staging**: Pre-production testing environment
- **Production**: Live app store releases

### Required Environment Variables

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true

# EAS Project Configuration
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id-here
```

### Optional Variables

```bash
# Analytics and Monitoring
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

For detailed configuration information, see [Configuration Guide](docs/CONFIGURATION.md) and [Build & Deployment Guide](docs/BUILD_AND_DEPLOYMENT.md).

## Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** for type safety

Pre-commit hooks automatically run linting and formatting.
