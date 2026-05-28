import { defineConfig } from 'vitest/config';

// Standalone Vitest config — no SvelteKit plugin so unit tests can run without
// the full app pipeline. Component tests (when we add them) can extend this.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
