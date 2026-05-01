// Expo SDK 54 picks up tsconfig "paths" automatically when this default config
// is used. Keeping the file explicit makes the intent visible.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
