const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle optimization configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Enable tree shaking and dead code elimination
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  warnings: false,
};

// Optimize asset handling
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Enable bundle splitting for better caching
config.serializer.createModuleIdFactory = function () {
  const fileToIdMap = new Map();
  let nextId = 0;
  
  return (path) => {
    if (!fileToIdMap.has(path)) {
      fileToIdMap.set(path, nextId++);
    }
    return fileToIdMap.get(path);
  };
};

// Optimize module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'ts', 'tsx'];

// Bundle size optimization
config.serializer.processModuleFilter = function (module) {
  // Filter out development-only modules in production
  if (process.env.NODE_ENV === 'production') {
    if (module.path.includes('__DEV__') || 
        module.path.includes('react-devtools') ||
        module.path.includes('flipper')) {
      return false;
    }
  }
  return true;
};

// Enable experimental features for better performance
config.transformer.experimentalImportSupport = true;
config.transformer.unstable_allowRequireContext = true;

module.exports = config;