# Expo Mobile Skeleton

A production-ready mobile app skeleton built with Expo React Native and TypeScript, featuring comprehensive development tools, state management, and a complete authentication flow.

## Features

- 🚀 **Expo SDK 53+** with TypeScript 5.4+ and strict type checking
- 📱 **Cross-platform** support (iOS, Android, Web)
- 🎨 **Complete UI System** with theme support (light/dark/system modes)
- 🧭 **Type-safe Navigation** with React Navigation 6
- 🔐 **Authentication Flow** with secure token management
- 📦 **Modern State Management** with Zustand stores
- 🛠️ **Development Tools** including debug menu and performance monitoring
- 🧪 **Comprehensive Testing** setup with Jest and React Native Testing Library
- 🔧 **Code Quality Tools** (ESLint, Prettier, Husky)
- 🚀 **Production Ready** with EAS Build and deployment configuration
- ♿ **Accessibility Support** with screen reader compatibility
- 🎯 **Path Aliases** configured for clean imports

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, Loading, DevMenu)
│   ├── forms/          # Form-specific components with validation
│   └── examples/       # Example/demo components
├── screens/            # Screen components organized by feature
│   ├── auth/          # Authentication flow screens
│   ├── home/          # Home section screens
│   ├── profile/       # User profile screens
│   ├── settings/      # App settings screens
│   └── debug/         # Development debug screens
├── navigation/         # Navigation configuration and navigators
├── store/             # Zustand state management
│   ├── authStore.ts   # Authentication state
│   ├── appStore.ts    # App settings and theme
│   └── networkStore.ts # Network connectivity state
├── services/          # API clients and external services
├── hooks/             # Custom React hooks
├── utils/             # Utility functions and helpers
├── theme/             # Theme system and styling utilities
├── types/             # TypeScript type definitions
├── contexts/          # React contexts
├── providers/         # Provider components
├── config/            # App configuration and environment
└── constants/         # App constants and theme tokens
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

## Architecture & Documentation

### Core Architecture

- **State Management**: Zustand stores with persistence and TypeScript support
- **Navigation**: Type-safe React Navigation with authentication flow
- **Theme System**: Comprehensive theming with light/dark/system modes
- **Error Handling**: Global error boundaries with crash reporting
- **Performance**: Lazy loading, memory management, and optimization utilities

### Development Tools

- **Debug Menu**: In-app debugging interface (development only)
- **Performance Monitoring**: Memory usage and performance tracking
- **Network Monitoring**: API request/response logging
- **State Inspection**: Real-time state debugging
- **Crash Reporting**: Error tracking and reporting utilities

### Documentation

- 📖 [Architecture Guide](docs/ARCHITECTURE.md) - System architecture and design patterns
- 🏪 [Store Documentation](docs/STORE.md) - Zustand state management architecture and patterns
- 🧩 [Components Documentation](docs/COMPONENTS.md) - Complete component library reference
- 🛠️ [Development Tools](docs/DEVELOPMENT_TOOLS.md) - Debugging and development utilities
- 🧪 [Testing Guide](docs/TESTING.md) - Comprehensive testing setup and utilities
- 🧪 [Test Server](docs/TEST_SERVER.md) - Mock API server for testing integrations
- 🌐 [Services & API](docs/SERVICES_API.md) - API integration and services layer
- 🔧 [Utils & Hooks](docs/UTILS_HOOKS.md) - Utility functions and custom hooks
- 📝 [Types Documentation](docs/TYPES.md) - TypeScript type system and definitions
- 🎨 [Assets Guide](docs/ASSETS.md) - Asset management and optimization
- 📜 [Scripts Guide](docs/SCRIPTS.md) - Build scripts and automation utilities
- ⚙️ [Configuration Guide](docs/CONFIGURATION.md) - Environment and build configuration
- 🚀 [Build & Deployment](docs/BUILD_AND_DEPLOYMENT.md) - Build and deployment processes
- 🔄 [Migration Summary](docs/MIGRATION_SUMMARY.md) - Redux to Zustand migration details
- ✅ [Final Integration](docs/FINAL_INTEGRATION.md) - Integration completion status
- 📝 [Recent Updates](docs/RECENT_UPDATES.md) - Latest improvements and changes (v1.2.3 - TypeScript 5.4+ and Enhanced ESLint Configuration)

## Code Quality

This project maintains high code quality with:

- **TypeScript** with strict mode enabled
- **ESLint** for code linting with React Native rules
- **Prettier** for consistent code formatting
- **Husky** for pre-commit hooks
- **Jest** for unit and integration testing
- **React Native Testing Library** for component testing

Pre-commit hooks automatically run linting, formatting, and type checking.
