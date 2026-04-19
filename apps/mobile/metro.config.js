/**
 * Metro config for monorepo (Expo 52 / Expo Router v4)
 * https://docs.expo.dev/guides/monorepos/
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;                           // apps/mobile
const monorepoRoot = path.resolve(projectRoot, '../..'); // local-music/

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo so shared packages update live
config.watchFolders = [monorepoRoot];

// 2. Resolve order: project node_modules FIRST, then root node_modules.
//    IMPORTANT: Do NOT use disableHierarchicalLookup — it breaks @expo/metro-runtime resolution.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot,  'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Pin packages that MUST resolve from THIS project's node_modules.
//    expo-router/_ctx.*.js needs babel-preset-expo to inline EXPO_ROUTER_APP_ROOT
//    at build time. That only happens when expo-router is in the project's own
//    node_modules (where Metro applies our babel config).
config.resolver.extraNodeModules = {
  // Core — must be single instances
  'react':                    path.resolve(projectRoot, 'node_modules/react'),
  'react-native':             path.resolve(projectRoot, 'node_modules/react-native'),
  // Expo packages that need babel-preset-expo transform
  'expo':                     path.resolve(projectRoot, 'node_modules/expo'),
  'expo-router':              path.resolve(projectRoot, 'node_modules/expo-router'),
  '@expo/metro-runtime':      path.resolve(projectRoot, 'node_modules/@expo/metro-runtime'),
  // Reanimated must be a single instance across the bundle
  'react-native-reanimated':  path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
};

module.exports = config;
