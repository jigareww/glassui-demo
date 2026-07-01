module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app': './src/app',
          '@features': './src/features',
          '@shared': './src/shared',
          '@assets': './src/assets',
          '@theme': './src/app/theme',
          '@services': './src/app/services',
          '@hooks': './src/app/hooks',
          '@utils': './src/app/utils',
          '@types': './src/app/types',
          '@config': './src/app/config',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
