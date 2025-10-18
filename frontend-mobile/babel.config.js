module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
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
          },
        },
      ],
    ],
  };
};