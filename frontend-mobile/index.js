// Ensure SSR/web polyfills are registered before the app loads
require('./src/polyfills/web');

// Defer to Expo Router's default entry
module.exports = require('expo-router/entry');


