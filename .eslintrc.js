module.exports = {
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/dist/*', '/node_modules/*', '/coverage/*'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
