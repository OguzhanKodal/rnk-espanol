// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Raw data (generated Quran source) and vendored Python packages are not app code.
    ignores: ['dist/*', 'data-src/**', 'scripts/.venv/**', 'android/**', 'ios/**'],
  },
]);
