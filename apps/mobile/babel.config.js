const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Explicitly tell babel-preset-expo where the app/ directory is.
          // This ensures EXPO_ROUTER_APP_ROOT is inlined as a static string
          // at build time, fixing the require.context TransformError.
          jsxRuntime: 'automatic',
        },
      ],
    ],
    plugins: [
      // reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};
