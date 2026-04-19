/**
 * Metro config for monorepo (Expo 52 / Expo Router v4)
 * https://docs.expo.dev/guides/monorepos/
 *
 * Root cause of TransformError:
 *   expo-router/_ctx.android.js uses require.context(process.env.EXPO_ROUTER_APP_ROOT).
 *   babel-preset-expo inlines that env var at build time — but ONLY if expo-router
 *   is resolved from THIS project's node_modules (so babel can transform it).
 *   When Metro resolves it from the root monorepo node_modules the transform never runs.
 *
 * Fix: pin expo-router + key packages to this project's node_modules.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;                             // apps/mobile
const monorepoRoot = path.resolve(projectRoot, '../..'); // local-music/

const config = getDefaultConfig(projectRoot);

// ── 1. Watch the whole monorepo so shared packages update live ─────────────
config.watchFolders = [monorepoRoot];

// ── 2. Resolve: prefer local node_modules over root node_modules ───────────
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot,  'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// ── 3. Pin critical packages that MUST be transformed from this project ─────
//    This prevents Metro picking them from root node_modules where babel
//    preset-expo hasn't touched them yet.
config.resolver.extraNodeModules = {
  'expo-router':             path.resolve(projectRoot, 'node_modules/expo-router'),
  'react':                   path.resolve(projectRoot, 'node_modules/react'),
  'react-native':            path.resolve(projectRoot, 'node_modules/react-native'),
  'expo':                    path.resolve(projectRoot, 'node_modules/expo'),
  'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
};

// ── 4. Don't walk up past the project root for node_modules ───────────────
//    Without this Metro falls back to root node_modules too eagerly.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
