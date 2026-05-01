/* eslint-disable */
// Mock AsyncStorage so Zustand's persist middleware doesn't error during tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
