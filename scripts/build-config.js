#!/usr/bin/env node

/**
 * Build Configuration Script
 * Helps manage different build configurations and environment setups
 */

const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = ['development', 'staging', 'production'];

function loadEnvFile(environment) {
  const envFile =
    environment === 'development' ? '.env' : `.env.${environment}`;
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    console.warn(`Warning: Environment file ${envFile} not found`);
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function validateEnvironment(environment, envVars) {
  const requiredVars = [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_APP_ENV',
    'EXPO_PUBLIC_EAS_PROJECT_ID',
  ];

  const missing = requiredVars.filter(varName => !envVars[varName]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables for ${environment}:`
    );
    missing.forEach(varName => console.error(`   - ${varName}`));
    return false;
  }

  return true;
}

function generateBuildInfo(environment, envVars) {
  const buildInfo = {
    environment,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    buildNumber: Date.now().toString(),
    config: {
      apiUrl: envVars.EXPO_PUBLIC_API_URL,
      debugMode: envVars.EXPO_PUBLIC_DEBUG_MODE === 'true',
      analyticsEnabled: !!envVars.EXPO_PUBLIC_ANALYTICS_ID,
      crashReportingEnabled: !!envVars.EXPO_PUBLIC_SENTRY_DSN,
    },
  };

  const buildInfoPath = path.join(process.cwd(), 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

  console.log(`✅ Build info generated for ${environment}`);
  return buildInfo;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1];

  if (command === 'validate') {
    if (!environment || !ENVIRONMENTS.includes(environment)) {
      console.error('Usage: node build-config.js validate <environment>');
      console.error(`Available environments: ${ENVIRONMENTS.join(', ')}`);
      process.exit(1);
    }

    console.log(`🔍 Validating ${environment} environment...`);
    const envVars = loadEnvFile(environment);

    if (validateEnvironment(environment, envVars)) {
      console.log(`✅ ${environment} environment is valid`);
      generateBuildInfo(environment, envVars);
    } else {
      process.exit(1);
    }
  } else if (command === 'list') {
    console.log('Available environments:');
    ENVIRONMENTS.forEach(env => {
      const envFile = env === 'development' ? '.env' : `.env.${env}`;
      const exists = fs.existsSync(path.join(process.cwd(), envFile));
      console.log(`  ${env}: ${exists ? '✅' : '❌'} (${envFile})`);
    });
  } else {
    console.log('Build Configuration Script');
    console.log('');
    console.log('Commands:');
    console.log(
      '  validate <environment>  - Validate environment configuration'
    );
    console.log('  list                    - List available environments');
    console.log('');
    console.log(`Available environments: ${ENVIRONMENTS.join(', ')}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadEnvFile,
  validateEnvironment,
  generateBuildInfo,
  ENVIRONMENTS,
};
