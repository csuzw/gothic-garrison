import { expect, test } from '@playwright/test';

test.describe('auth', () => {
  // Visual capture of both auth pages, on every viewport (desktop + phone).
  test('auth page screenshots', async ({ page }, testInfo) => {
    await page.goto('/sign-up');
    await expect(page.getByRole('heading', { name: /Create account/i })).toBeVisible();
    await testInfo.attach('sign-up', {
      body: await page.screenshot({
        path: `test-results/screenshots/sign-up-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });

    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await testInfo.attach('sign-in', {
      body: await page.screenshot({
        path: `test-results/screenshots/sign-in-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });
  });

  // Full email/password flow: sign up → signed-in navbar → sign out. Creates a
  // real row; emails are namespaced `e2e+...@example.com` for cleanup.
  test('sign-up → signed-in → sign-out flow', async ({ page }, testInfo) => {
    // The preview build serves over http, where WebKit refuses better-auth's
    // Secure session cookie (Chromium allows it on localhost). Real `pnpm dev`
    // (non-secure cookies) and real prod (https) are both fine, so assert the
    // flow on chromium only rather than weakening cookie security.
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'WebKit drops Secure cookies over the http preview build',
    );

    await page.goto('/sign-up');
    const email = `e2e+${testInfo.project.name}-${Date.now()}@example.com`;
    await page.locator('input[autocomplete="name"]').fill('E2E Tester');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[autocomplete="new-password"]').fill('test-password-123');
    await page.getByRole('button', { name: /Create account/i }).click();

    // Redirected to the units home, now signed in
    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();

    // Account menu in the navbar; open it and confirm our email shows
    await page.locator('details.dropdown-end > summary').click();
    await expect(page.locator('.dropdown-content').getByText(email)).toBeVisible();

    // Sign out → the "Sign in" link returns
    await page.getByRole('button', { name: /Sign out/i }).click();
    await expect(page.getByRole('banner').getByRole('link', { name: /^Sign in$/i })).toBeVisible();
  });
});
