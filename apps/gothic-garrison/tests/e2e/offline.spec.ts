import { expect, test } from '@playwright/test';

test.describe('offline strategy', () => {
  test('reference snapshot endpoint returns a valid data shape', async ({ request }) => {
    const res = await request.get('/api/reference/snapshot');

    expect(res.ok()).toBe(true);
    expect(res.headers()['cache-control']).toContain('public');

    const data = await res.json();
    // Structural shape — present regardless of whether the DB is seeded.
    expect(data).toHaveProperty('nations');
    expect(data).toHaveProperty('soldiers');
    expect(data).toHaveProperty('attributes');
    expect(data).toHaveProperty('equipment');
    expect(Array.isArray(data.nations)).toBe(true);
    expect(Array.isArray(data.soldiers)).toBe(true);
    // Nation shape when data exists.
    if (data.nations.length > 0) {
      expect(data.nations[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
    }
  });

  test('offline banner appears when network is disconnected', async ({ page, context }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No banner while online.
    const banner = page.getByText(/Offline — new units are saved locally/);
    await expect(banner).not.toBeVisible();

    await context.setOffline(true);

    // The layout's window 'offline' event handler flips isOnline, which renders the banner.
    await expect(banner).toBeVisible({ timeout: 3000 });

    const png = await page.screenshot({
      path: `test-results/screenshots/offline-banner-${testInfo.project.name}.png`,
    });
    await testInfo.attach('offline-banner', { body: png, contentType: 'image/png' });

    await context.setOffline(false);
  });

  test('reference snapshot is available after going offline (Workbox cache)', async ({
    page,
    context,
  }, testInfo) => {
    // This test verifies the runtime-caching contract: after a normal online visit
    // warms the Workbox cache, the snapshot endpoint responds even when offline.
    // Only meaningful on Chromium — the service worker lifecycle differs on WebKit.
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Service-worker runtime caching is only verified on Chromium',
    );

    // 1. Visit the home page; onMount warms the reference cache.
    await page.goto('/');
    await page.waitForResponse('/api/reference/snapshot');
    await page.waitForLoadState('networkidle');

    // 2. Go offline.
    await context.setOffline(true);

    // 3. The service worker should serve the cached snapshot from the runtime cache.
    //    Trigger a client-side fetch to the endpoint and verify it resolves.
    const data = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/reference/snapshot');
        return res.ok ? res.json() : null;
      } catch {
        return null;
      }
    });

    expect(data).not.toBeNull();
    expect(data).toHaveProperty('nations');
    expect(data).toHaveProperty('soldiers');

    await context.setOffline(false);
  });
});
