module.exports = function (api) {
  const isTest = api.env('test');
  api.cache.using(() => isTest);
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Disable reanimated plugin in test environment
          reanimated: !isTest,
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/services': './src/services',
            '@/store': './src/store',
            '@/utils': './src/utils',
            '@/hooks': './src/hooks',
            '@/types': './src/types',
            '@/constants': './src/constants',
          },
        },
      ],
    ],
  };
};
