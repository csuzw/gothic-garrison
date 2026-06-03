import { defineConfig, devices } from '@playwright/test';

// Two surfaces are tested:
//  • the production build (`pnpm preview`, :4173) — all routes including the
//    Codex read-only view; prod-gate checks that Codex write paths 404 there.
//  • the dev server (`pnpm dev`, :5173) — the Codex write UI and the read-only
//    preview toggle. Tests live in codex-ui.spec.ts and run under the
//    `codex-dev` project; DB-dependent tests need Postgres
//    (`docker compose up -d`) and skip themselves if the dev API isn't reachable.
const CODEX_UI = /codex-ui\.spec\.ts/;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      testIgnore: CODEX_UI,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'mobile-safari',
      testIgnore: CODEX_UI,
      use: { ...devices['iPhone 14'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'codex-dev',
      testMatch: CODEX_UI,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173' },
    },
  ],
  webServer: [
    {
      command: 'pnpm build && pnpm preview --port 4173',
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    // Dev server only started locally — CI runs the production surface only.
    ...(!process.env.CI ? [{
      command: 'pnpm dev --port 5173',
      port: 5173,
      reuseExistingServer: true,
      timeout: 120_000,
    }] : []),
  ],
});
