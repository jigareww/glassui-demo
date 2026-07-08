/**
 * @format
 */

import './src/app/config/shims';
import { AppRegistry, LogBox } from 'react-native';

// Suppress harmless Solana Devnet rate-limit warnings from interrupting the UI
LogBox.ignoreLogs([
  'Server responded with 429',
]);
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
