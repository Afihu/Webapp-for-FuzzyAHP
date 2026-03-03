/**
 * app.js
 * Application entry point.
 *
 * Responsibilities:
 *  1. Load any previously saved state from localStorage.
 *  2. Ensure the URL hash reflects the correct starting step.
 *  3. Instantiate and start the router.
 */

import { loadState, getState } from './state.js';
import { Router } from './router.js';
import { STEPS } from './utils/constants.js';

// Load persisted state before anything else
loadState();

const appEl = document.getElementById('app');

if (!appEl) {
  throw new Error('Could not find #app element. Check index.html.');
}

// If there is no hash, set one before the router starts so _resolveRoute()
// reads the correct step on its first call (avoids a double-mount).
if (!window.location.hash) {
  const state = getState();
  const lastStep = state.currentStep && state.currentStep !== STEPS.HOME
    ? state.currentStep
    : STEPS.HOME;
  // Replace history entry so "back" doesn't loop back to the bare URL
  history.replaceState(null, '', `#${lastStep}`);
}

const router = new Router(appEl);
router.start();

