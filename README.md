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

- `npm run build:android` - Build for Android
- `npm run build:ios` - Build for iOS
- `npm run build:all` - Build for all platforms

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_APP_ENV=development
```

## Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** for type safety

Pre-commit hooks automatically run linting and formatting.
