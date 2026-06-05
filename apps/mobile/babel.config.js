const path = require('path');

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@fitcheck/shared': path.resolve(__dirname, './src/types/shared.ts'),
            '@': path.resolve(__dirname, './src'),
          },
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.json'],
        },
      ],
      'react-native-worklets-core/plugin',
      'react-native-reanimated/plugin',
    ],
  };
};
