import { expect, test } from '@playwright/test';

const themes = ['garrison', 'garrison-light'] as const;

test.describe('home (units)', () => {
  for (const theme of themes) {
    test(`renders the units home (${theme}), with screenshot`, async ({ page }, testInfo) => {
      // Seed the saved theme before any page script runs, so the pre-paint
      // theme guard in app.html picks it up — exercises the real code path.
      await page.addInitScript((t) => {
        localStorage.setItem('theme', t);
      }, theme);

      await page.goto('/');

      await expect(page.getByRole('link', { name: /Gothic Garrison/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();

      const png = await page.screenshot({
        path: `test-results/screenshots/home-${theme}-${testInfo.project.name}.png`,
        fullPage: true,
      });
      await testInfo.attach(`home-${theme}`, { body: png, contentType: 'image/png' });
    });
  }
});

test.describe('about', () => {
  test('shows the sources panel and reference changelog', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: /^Sources$/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Reference data changelog/i })).toBeVisible();
  });
});

