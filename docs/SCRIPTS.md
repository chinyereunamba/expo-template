# Scripts Documentation

This document covers the build scripts, configuration utilities, and automation tools available in the Expo Mobile Skeleton app.

## Overview

The `scripts/` directory contains utility scripts for:

- **Build Configuration**: Environment validation and build setup
- **Environment Management**: Environment variable validation and setup
- **Integration Verification**: Testing and validation utilities
- **Build Utilities**: Common build and deployment helpers

## Build Configuration Script

### build-config.js

**Location**: `scripts/build-config.js`

A comprehensive script for managing build configurations across different environments.

#### Features

- **Environment Validation**: Validates required environment variables
- **Build Info Generation**: Creates build metadata for deployments
- **Configuration Loading**: Loads and parses environment files
- **Multi-Environment Support**: Supports development, staging, and production

#### Usage

```bash
# Validate environment configuration
node scripts/build-config.js validate development
node scripts/build-config.js validate staging
node scripts/build-config.js validate production

# List available environments
node scripts/build-config.js list
```

#### Environment Validation

The script validates the following required variables:

```javascript
const requiredVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_EAS_PROJECT_ID',
];
```

#### Build Info Generation

Generates `build-info.json` with:

```json
{
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "buildNumber": "1704067200000",
  "config": {
    "apiUrl": "https://api.example.com",
    "debugMode": false,
    "analyticsEnabled": true,
    "crashReportingEnabled": true
  }
}
```

#### Functions

```javascript
// Load environment variables from file
const envVars = loadEnvFile('production');

// Validate environment configuration
const isValid = validateEnvironment('production', envVars);

// Generate build information
const buildInfo = generateBuildInfo('production', envVars);
```

## Environment Setup Script

### setup-env.js

**Location**: `scripts/setup-env.js`

Interactive script for setting up environment configuration files.

#### Features

- **Interactive Setup**: Guided environment variable configuration
- **Template Generation**: Creates environment files from templates
- **Validation**: Validates configuration during setup
- **Multi-Environment**: Supports all environment types

#### Usage

```bash
# Interactive environment setup
npm run setup:env

# Or run directly
node scripts/setup-env.js
```

#### Setup Process

1. **Environment Selection**: Choose target environment
2. **Variable Input**: Enter required environment variables
3. **Validation**: Validate configuration values
4. **File Generation**: Create environment file
5. **Verification**: Verify setup completion

## Build Utilities

### build-utils.js

**Location**: `scripts/build-utils.js`

Common utilities for build processes and deployment preparation.

#### Features

- **Asset Processing**: Optimize and process app assets
- **Bundle Analysis**: Analyze bundle size and composition
- **Cache Management**: Manage build caches
- **Deployment Preparation**: Prepare builds for deployment

#### Functions

```javascript
// Process and optimize assets
await processAssets();

// Analyze bundle composition
const analysis = await analyzeBundleSize();

// Clear build caches
await clearBuildCache();

// Prepare deployment artifacts
await prepareDeployment('production');
```

## Integration Verification Script

### verify-integration.js

**Location**: `scripts/verify-integration.js`

Comprehensive integration testing and verification script.

#### Features

- **Component Integration**: Verify component integrations
- **API Integration**: Test API connectivity and responses
- **Navigation Integration**: Verify navigation flows
- **Store Integration**: Test state management integration
- **Performance Verification**: Check performance metrics

#### Usage

```bash
# Run full integration verification
npm run verify:integration

# Or run directly
node scripts/verify-integration.js
```

#### Verification Checks

1. **Environment Configuration**
   - Validate all environment variables
   - Check API connectivity
   - Verify external service connections

2. **Component Integration**
   - Test component rendering
   - Verify theme integration
   - Check accessibility compliance

3. **Navigation Integration**
   - Test navigation flows
   - Verify route configurations
   - Check deep linking

4. **State Management**
   - Test store integrations
   - Verify persistence
   - Check state synchronization

5. **Performance Metrics**
   - Bundle size analysis
   - Memory usage checks
   - Render performance validation

#### Output

```bash
✅ Environment Configuration
✅ Component Integration
✅ Navigation Integration
✅ State Management
✅ Performance Metrics

🎉 All integrations verified successfully!
```

## NPM Scripts Integration

### Package.json Scripts

The build scripts are integrated with npm scripts for easy access:

```json
{
  "scripts": {
    "setup:env": "node scripts/setup-env.js",
    "config:validate": "node scripts/build-config.js validate",
    "config:list": "node scripts/build-config.js list",
    "verify:integration": "node scripts/verify-integration.js",
    "build:utils": "node scripts/build-utils.js"
  }
}
```

### Environment-Specific Scripts

```json
{
  "scripts": {
    "build:dev": "npm run config:validate development && expo build",
    "build:staging": "npm run config:validate staging && expo build",
    "build:prod": "npm run config:validate production && expo build"
  }
}
```

## Configuration Management

### Environment Files

The scripts work with multiple environment files:

- `.env` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment
- `.env.example` - Template file

### Configuration Validation

Each environment must include:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_VERSION=v1

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DEBUG_MODE=false

# EAS Configuration
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id

# Optional Services
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Build Process Integration

### Pre-Build Validation

```bash
# Validate environment before building
npm run config:validate production

# Generate build info
node scripts/build-config.js validate production

# Verify integrations
npm run verify:integration
```

### Build Pipeline

1. **Environment Validation**: Validate configuration
2. **Dependency Check**: Verify all dependencies
3. **Integration Test**: Run integration verification
4. **Asset Processing**: Optimize assets
5. **Bundle Generation**: Create app bundle
6. **Deployment Preparation**: Prepare for deployment

### Post-Build Verification

```bash
# Verify build artifacts
npm run verify:build

# Analyze bundle size
npm run analyze:bundle

# Test deployment readiness
npm run test:deployment
```

## Continuous Integration

### GitHub Actions Integration

The scripts integrate with CI/CD pipelines:

```yaml
# .github/workflows/build.yml
- name: Validate Environment
  run: npm run config:validate production

- name: Verify Integration
  run: npm run verify:integration

- name: Build Application
  run: npm run build:prod
```

### Quality Gates

- **Configuration Validation**: All required variables present
- **Integration Verification**: All integrations working
- **Performance Checks**: Performance metrics within limits
- **Security Validation**: No security vulnerabilities

## Error Handling

### Common Issues

1. **Missing Environment Variables**

   ```bash
   ❌ Missing required environment variables for production:
      - EXPO_PUBLIC_API_URL
      - EXPO_PUBLIC_EAS_PROJECT_ID
   ```

2. **Invalid Configuration**

   ```bash
   ❌ Invalid API URL format: not-a-url
   ```

3. **Integration Failures**
   ```bash
   ❌ API connectivity test failed
   ❌ Navigation integration test failed
   ```

### Troubleshooting

```bash
# Check environment file exists
ls -la .env*

# Validate specific environment
npm run config:validate development

# Run integration tests
npm run verify:integration

# Check build configuration
node scripts/build-config.js list
```

## Best Practices

### Script Development

1. **Error Handling**: Implement comprehensive error handling
2. **Logging**: Provide clear, actionable feedback
3. **Validation**: Validate inputs and configurations
4. **Documentation**: Document script usage and options
5. **Testing**: Test scripts across different environments

### Configuration Management

1. **Environment Separation**: Keep environments separate and secure
2. **Variable Validation**: Validate all configuration variables
3. **Secret Management**: Never commit secrets to version control
4. **Documentation**: Document all configuration options
5. **Backup**: Maintain backup configurations

### Build Process

1. **Automation**: Automate repetitive build tasks
2. **Validation**: Validate builds before deployment
3. **Monitoring**: Monitor build performance and success rates
4. **Rollback**: Maintain rollback capabilities
5. **Documentation**: Document build processes and requirements

## Extending Scripts

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add appropriate error handling
3. Include usage documentation
4. Add npm script entry
5. Update this documentation

### Script Template

```javascript
#!/usr/bin/env node

/**
 * Script Name
 * Description of what the script does
 */

const fs = require('fs');
const path = require('path');

function main() {
  try {
    // Script logic here
    console.log('✅ Script completed successfully');
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  // Export functions for testing
};
```

The scripts in this project provide a robust foundation for build automation, configuration management, and deployment processes, ensuring consistent and reliable application builds across all environments.
