const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add any additional asset extensions your app uses
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// Use default transformer; avoid overriding to prevent Metro errors

// Web-specific configuration
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.platforms = ['web', 'native', 'ios', 'android'];
}

// Keep extraNodeModules defined if needed elsewhere
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
};

// Configure path aliases for Metro bundler
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  '@': './src',
  '@/components': './src/components',
  '@/features': './src/features',
  '@/services': './src/services',
  '@/theme': './src/theme',
  '@/hooks': './src/hooks',
  '@/utils': './src/utils',
  '@/config': './src/config',
  '@/i18n': './src/i18n',
  '@/ui': './src/ui',
  '@/polyfills': './src/polyfills',
  '@/api': './src/api',
  '@/constants': './src/constants',
  '@/context': './src/context',
  '@/navigation': './src/navigation',
  '@/plugins': './src/plugins',
  '@/screens': './src/screens',
  '@/test': './src/test',
  '@/types': './src/types',
};

// Ensure proper module resolution for dynamic imports
// config.resolver.unstable_enablePackageExports = true;

// Tamagui specific config for web + native
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

module.exports = config;
