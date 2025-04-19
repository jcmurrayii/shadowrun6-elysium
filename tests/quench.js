/**
 * Shadowrun 6e Quench Tests
 */

import edgeAwardingTests from './edge-awarding.test.js';

Hooks.on('quenchReady', (quench) => {
  // Register all test batches
  quench.registerBatch(edgeAwardingTests.key, edgeAwardingTests.options, edgeAwardingTests);
  
  // Add more test batches here as needed
});
