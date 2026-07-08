import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Expose Buffer globally for low-level cryptographic functions
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Expose process for compatibility with standard npm libraries
if (typeof global.process === 'undefined') {
  // @ts-ignore
  global.process = {};
}
if (typeof global.process.env === 'undefined') {
  // @ts-ignore
  global.process.env = {};
}
