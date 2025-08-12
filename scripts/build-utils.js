#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = {
  development: {
    envFile: '.env',
    buildProfile: 'development',
    updateChannel: 'development',
  },
  staging: {
    envFile: '.env.staging',
    buildProfile: 'preview',
    updateChannel: 'preview',
  },
  production: {
    envFile: '.env.production',
    buildProfile: 'production',
    updateChannel: 'production',
  },
};

function loadEnvFile(envFile) {
  if (!fs.existsSync(envFile)) {
    console.warn(`Warning: ${envFile} not found`);
    return;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

  Object.assign(process.env, envVars);
}

function buildApp(environment, platform = 'all') {
  const config = ENVIRONMENTS[environment];
  if (!config) {
    console.error(`Invalid environment: ${environment}`);
    process.exit(1);
  }

  console.log(`Building for ${environment} environment...`);
  loadEnvFile(config.envFile);

  const command = `eas build --profile ${config.buildProfile} --platform ${platform}`;
  console.log(`Running: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Build completed for ${environment}`);
  } catch (error) {
    console.error(`❌ Build failed for ${environment}:`, error.message);
    process.exit(1);
  }
}

function publishUpdate(environment) {
  const config = ENVIRONMENTS[environment];
  if (!config) {
    console.error(`Invalid environment: ${environment}`);
    process.exit(1);
  }

  console.log(`Publishing update for ${environment} environment...`);
  loadEnvFile(config.envFile);

  const command = `eas update --channel ${config.updateChannel} --message "Update for ${environment}"`;
  console.log(`Running: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Update published for ${environment}`);
  } catch (error) {
    console.error(`❌ Update failed for ${environment}:`, error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage: node scripts/build-utils.js <command> [options]

Commands:
  build <env> [platform]    Build app for environment (development|staging|production)
                           Platform: ios|android|all (default: all)
  
  update <env>             Publish OTA update for environment
  
  help                     Show this help message

Examples:
  node scripts/build-utils.js build staging ios
  node scripts/build-utils.js update production
  node scripts/build-utils.js build development
`);
}

// Parse command line arguments
const [, , command, ...args] = process.argv;

switch (command) {
  case 'build':
    const [env, platform] = args;
    if (!env) {
      console.error('Environment is required');
      showHelp();
      process.exit(1);
    }
    buildApp(env, platform);
    break;

  case 'update':
    const [updateEnv] = args;
    if (!updateEnv) {
      console.error('Environment is required');
      showHelp();
      process.exit(1);
    }
    publishUpdate(updateEnv);
    break;

  case 'help':
  default:
    showHelp();
    break;
}
