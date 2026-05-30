import { defineConfig, devices } from '@playwright/test';

// Two surfaces are tested:
//  • the production build (`pnpm preview`, :4173) — everything except the Codex
//    UI, including the prod-gate checks that the Codex 404s there.
//  • the dev server (`pnpm dev`, :5173) — the local-development-only Codex UI,
//    which by design only exists when `dev` is true. Its tests live in
//    codex-ui.spec.ts and run under the `codex-dev` project; they need Postgres
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
    {
      command: 'pnpm dev --port 5173',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
