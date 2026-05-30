import { expect, test } from '@playwright/test';

// These tests run against `pnpm build && pnpm preview` (see playwright.config.ts)
// — i.e. a production build, where `$app/environment`'s `dev` is false. That is
// exactly the environment in which the Codex must be inaccessible, so this file
// asserts the production guarantee: the route 404s and its nav link is hidden.
test.describe('codex (production gate)', () => {
  test('the /codex route 404s in a production build', async ({ page }) => {
    const response = await page.goto('/codex');
    expect(response?.status()).toBe(404);
  });

  test('no Codex nav link is rendered in a production build', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Codex' })).toHaveCount(0);
  });

  test('the /api/codex write endpoints 404 in a production build', async ({ request }) => {
    expect((await request.get('/api/codex/nations')).status()).toBe(404);
    const created = await request.post('/api/codex/nations', { data: { name: 'X', sourceId: 'x' } });
    expect(created.status()).toBe(404);
    const exported = await request.post('/api/codex/export', { data: { note: 'x' } });
    expect(exported.status()).toBe(404);
  });

  test('a Codex entity page 404s in a production build', async ({ page }) => {
    const response = await page.goto('/codex/nations');
    expect(response?.status()).toBe(404);
  });
});
