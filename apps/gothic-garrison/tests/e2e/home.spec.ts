import { expect, test } from '@playwright/test';

test.describe('landing page', () => {
  test('renders the brand and the sources panel, with screenshot', async ({ page }, testInfo) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Gothic Garrison/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Build your warband/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Sources/i })).toBeVisible();

    // Always capture a screenshot so the author can eyeball the result without
    // running the app manually.
    await testInfo.attach('home', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
});
