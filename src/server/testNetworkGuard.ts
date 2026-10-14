/**
 * Shared network guard for tests.
 *
 * Any test that forgets to stub `fetch` fails loudly and locally instead of
 * silently issuing a real request to the configured provider. This is a test
 * helper, not application code: it is never imported by the server or by any
 * Vercel function.
 */

import { beforeEach, vi } from 'vitest';

/**
 * Replace the global fetch with a throwing stub.
 *
 * Call this from a test file's `beforeEach` (via `useNetworkGuard`) or per
 * test. Individual tests then override it with their own mock.
 */
export function installNetworkGuard(): void {
  vi.stubGlobal(
    'fetch',
    () => {
      throw new Error(
        'BLOCKED: an unstubbed fetch reached the network guard. ' +
          'Tests must mock the provider response.'
      );
    }
  );
}

/** Install the guard for the entire calling test file. */
export function useNetworkGuard(): void {
  beforeEach(() => {
    installNetworkGuard();
  });
}