import { expect, test, type APIRequestContext } from '@playwright/test';

// Runs under the `codex-dev` Playwright project against `pnpm dev` (:5173),
// where the local-development-only Codex is reachable. Needs Postgres up
// (`docker compose up -d`); skips itself if the dev API isn't available.
//
// Uses optional-rules (normally an empty table) as the throwaway entity, with a
// unique code per run, and cleans up after itself. It deliberately does NOT
// click "Export" — that would rewrite the committed seed-data.ts / changelog.
// The export endpoint + file writing are covered by the db round-trip checks.

const code = () => `e2e_${Date.now()}`;

async function deleteRulesByPrefix(request: APIRequestContext, prefix: string) {
  const res = await request.get('/api/codex/optional-rules');
  if (!res.ok()) return;
  const { items } = await res.json();
  for (const r of items as { id: string; code: string }[]) {
    if (r.code.startsWith(prefix)) await request.delete(`/api/codex/optional-rules/${r.id}`);
  }
}

test.describe('codex UI (dev only)', () => {
  // These tests share one database (optional-rules), so run them serially to
  // avoid one test's cleanup deleting another's rows.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    let ready = false;
    try {
      const res = await request.get('/api/codex/sources');
      ready = res.ok() && ((await res.json()).items?.length ?? 0) > 0;
    } catch {
      ready = false;
    }
    test.skip(!ready, 'Codex dev API/DB not available — run `docker compose up -d` + `pnpm db:seed`.');
    await deleteRulesByPrefix(request, 'e2e_');
  });

  test.afterEach(async ({ request }) => {
    await deleteRulesByPrefix(request, 'e2e_').catch(() => {});
  });

  test('overview lists entities with counts and an export action', async ({ page }, testInfo) => {
    await page.goto('/codex');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration
    await expect(page.getByRole('heading', { name: 'Codex' })).toBeVisible();
    // "Equipment" appears as both a nav tab and an overview card — scope to nav.
    await expect(page.locator('nav.tabs').getByRole('link', { name: 'Equipment' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export to repo/ })).toBeVisible();

    // The export modal opens with a note field — but we do not export (it would
    // rewrite committed files), just confirm the UI is wired, then close.
    await page.getByRole('button', { name: /Export to repo/ }).click();
    await expect(page.getByRole('heading', { name: 'Export to repo' })).toBeVisible();
    await expect(page.locator('.modal-open input')).toBeVisible();
    await expect(page.locator('.modal-open').getByRole('button', { name: 'Export', exact: true })).toBeVisible();
    await page.locator('.modal-action').getByRole('button', { name: 'Close' }).click();

    await testInfo.attach('codex-overview', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });

  test('create, edit, then delete a flat entity', async ({ page }, testInfo) => {
    const c = code();
    await page.goto('/codex/optional-rules');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration
    await expect(page.getByRole('heading', { name: 'Optional rules' })).toBeVisible();
    const initial = await page.locator('tbody tr').count();

    // Create
    await page.getByRole('button', { name: 'New optional rule' }).click();
    await page.getByLabel('Code').fill(c);
    await page.getByLabel('Name').fill('E2E Rule');
    await page.getByLabel('Description').fill('Created by the Codex UI e2e test.');
    await page.getByLabel('Source').selectOption({ index: 1 });
    await testInfo.attach('codex-create-form', { body: await page.screenshot(), contentType: 'image/png' });
    await page.locator('.modal-open').getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: c, exact: true })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(initial + 1);

    // Edit
    await page.locator('tbody tr', { hasText: c }).getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Name').fill('E2E Rule Renamed');
    await page.locator('.modal-open').getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: 'E2E Rule Renamed', exact: true })).toBeVisible();

    // Delete (accept the confirm())
    page.on('dialog', (d) => d.accept());
    await page.locator('tbody tr', { hasText: c }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('tbody tr', { hasText: c })).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(initial);
  });

  test('surfaces a server error (duplicate code) in the form', async ({ page }) => {
    const c = code();
    await page.goto('/codex/optional-rules');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration

    async function fillNew(name: string) {
      await page.getByRole('button', { name: 'New optional rule' }).click();
      await page.getByLabel('Code').fill(c);
      await page.getByLabel('Name').fill(name);
      await page.getByLabel('Description').fill('duplicate-code test');
      await page.getByLabel('Source').selectOption({ index: 1 });
      await page.locator('.modal-open').getByRole('button', { name: 'Create' }).click();
    }

    // First create succeeds and closes the modal.
    await fillNew('First');
    await expect(page.locator('.modal-open')).toHaveCount(0);

    // Second create with the same code → server 409, surfaced in the form.
    await fillNew('Second');
    await expect(page.locator('.modal-open .alert-error')).toBeVisible();
    await expect(page.locator('.modal-open .alert-error')).toContainText(/already exists/i);
  });
});
