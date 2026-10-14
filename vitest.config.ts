import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts so the production build configuration is
// untouched. Only the test runner reads this file.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
