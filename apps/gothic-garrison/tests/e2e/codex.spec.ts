import { expect, test } from '@playwright/test';

// These tests run against `pnpm build && pnpm preview` (see playwright.config.ts)
// — a production build where `$app/environment`'s `dev` is false.
//
// Codex is readable in production (reference-data browser) but all write paths
// are blocked: pages return 200, the read API is open, write API endpoints return
// 404, and the UI renders no write controls whatsoever.

test.describe('codex (production build)', () => {
  test.describe('route availability', () => {
    test('/codex loads in a production build', async ({ page }) => {
      const response = await page.goto('/codex');
      expect(response?.status()).toBe(200);
    });

    test('a Codex entity page loads in a production build', async ({ page }) => {
      const response = await page.goto('/codex/sources');
      expect(response?.status()).toBe(200);
    });

    test('the Codex nav link is present in a production build', async ({ page }) => {
      await page.goto('/');
      // The link exists in both the mobile dropdown and the desktop nav; check
      // presence rather than visibility to avoid mobile-Safari dropdown failures.
      await expect(page.locator('a[href="/codex"]')).not.toHaveCount(0);
    });
  });

  test.describe('read-only UI in production', () => {
    test('no "Export to repo" button on the Codex overview', async ({ page }) => {
      await page.goto('/codex');
      await expect(page.getByRole('button', { name: /Export to repo/ })).toHaveCount(0);
    });

    test('no dev-only controls (warning badge, preview toggle)', async ({ page }) => {
      await page.goto('/codex');
      await expect(page.locator('.badge-warning')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Preview read-only/ })).toHaveCount(0);
    });

    test('no "New" button on a flat entity page', async ({ page }) => {
      await page.goto('/codex/sources');
      await expect(page.getByRole('button', { name: /New source/ })).toHaveCount(0);
    });

    test('no "New" button on the soldier types page', async ({ page }) => {
      await page.goto('/codex/soldier-types');
      await expect(page.getByRole('button', { name: /New soldier/ })).toHaveCount(0);
    });

    test('no "New" button on the monster types page', async ({ page }) => {
      await page.goto('/codex/monster-types');
      await expect(page.getByRole('button', { name: /New monster/ })).toHaveCount(0);
    });
  });

  test.describe('write API is blocked in production', () => {
    test('GET /api/codex/:entity is not 404 (read gate removed)', async ({ request }) => {
      const res = await request.get('/api/codex/nations');
      expect(res.status()).not.toBe(404);
    });

    test('POST /api/codex/:entity is 404', async ({ request }) => {
      const res = await request.post('/api/codex/nations', { data: { name: 'X', sourceId: 'x' } });
      expect(res.status()).toBe(404);
    });

    test('PATCH /api/codex/:entity/:id is 404', async ({ request }) => {
      const res = await request.patch(
        '/api/codex/nations/00000000-0000-0000-0000-000000000000',
        { data: { name: 'X' } },
      );
      expect(res.status()).toBe(404);
    });

    test('DELETE /api/codex/:entity/:id is 404', async ({ request }) => {
      const res = await request.delete(
        '/api/codex/nations/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status()).toBe(404);
    });

    test('POST /api/codex/export is 404', async ({ request }) => {
      const res = await request.post('/api/codex/export', { data: { note: 'x' } });
      expect(res.status()).toBe(404);
    });
  });
});
