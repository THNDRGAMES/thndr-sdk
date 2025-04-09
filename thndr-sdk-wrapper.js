// This is a wrapper script that imports the SDK as a module and exposes its functionality globally
import * as sdk from './thndr-sdk.js';

// Expose SDK functionality globally
window.initGame = sdk.initGame;
window.demoBalance = sdk.demoBalance || 1000; // Default value if not provided
window.cancelInvoice = sdk.cancelInvoice;
window.enableLogging = sdk.enableLogging;

console.log('SDK wrapper loaded, exposing functionality globally'); 