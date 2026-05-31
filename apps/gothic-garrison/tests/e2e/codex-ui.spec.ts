import { expect, test, type APIRequestContext } from '@playwright/test';

// Runs under the `codex-dev` Playwright project against `pnpm dev` (:5173),
// where the Codex write UI is reachable. Needs Postgres up
// (`docker compose up -d`); DB-dependent tests skip themselves if the dev API
// isn't available.
//
// The flat-entity CRUD tests use sources as the throwaway entity (unique `code`
// per run) and clean up after themselves. They deliberately do NOT click
// "Export" — that would rewrite the committed seed-data.ts / changelog.

const code = () => `e2e_${Date.now()}`;

// ── Read-only preview toggle ──────────────────────────────────────────────────
// Does not need Postgres — only exercises the layout-level toggle UI and checks
// the reactive chain from the layout button down to the entity page's write
// controls. Runs independently of the DB-guarded describe block below.

test.describe('codex read-only preview toggle (dev only)', () => {
  test('toggle hides write controls and the entity page responds reactively', async ({ page }, testInfo) => {
    await page.goto('/reference');

    // Dev defaults: write controls and the toggle button are present.
    await expect(page.getByRole('button', { name: /Export to repo/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview read-only' })).toBeVisible();
    await expect(page.locator('.badge-warning')).toBeVisible();

    // Activate preview mode.
    await page.getByRole('button', { name: 'Preview read-only' }).click();
    await expect(page.getByRole('button', { name: /Export to repo/ })).toHaveCount(0);
    await expect(page.locator('.badge-info')).toContainText('read-only preview');
    await expect(page.getByRole('button', { name: 'Exit preview' })).toBeVisible();

    // Navigate to an entity page via the tab — SvelteKit soft-nav keeps the
    // layout mounted so readonlyOverride state is preserved. Use exact: true to
    // avoid matching both the tab link and the overview card on the /codex page.
    await page.getByRole('link', { name: 'Sources', exact: true }).click();
    await expect(page.getByRole('button', { name: /New source/ })).toHaveCount(0);

    await testInfo.attach('sources-readonly-preview', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // Deactivate preview — the entity page's New button and the Export button
    // should reappear reactively without a page reload, validating the full
    // Svelte 5 context signal chain through the getter.
    await page.getByRole('button', { name: 'Exit preview' }).click();
    await expect(page.getByRole('button', { name: /New source/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export to repo/ })).toBeVisible();
  });
});

// ── DB-dependent write UI tests ───────────────────────────────────────────────

async function deleteSourcesByPrefix(request: APIRequestContext, prefix: string) {
  const res = await request.get('/api/reference/sources');
  if (!res.ok()) return;
  const { items } = await res.json();
  for (const r of items as { id: string; code: string }[]) {
    if (r.code.startsWith(prefix)) await request.delete(`/api/reference/sources/${r.id}`);
  }
}

test.describe('codex UI (dev only)', () => {
  // These tests share one database (sources), so run them serially to avoid
  // one test's cleanup deleting another's rows.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    let ready = false;
    try {
      const res = await request.get('/api/reference/sources');
      ready = res.ok() && ((await res.json()).items?.length ?? 0) > 0;
    } catch {
      ready = false;
    }
    test.skip(!ready, 'Codex dev API/DB not available — run `docker compose up -d` + `pnpm db:seed`.');
    await deleteSourcesByPrefix(request, 'e2e_');
  });

  test.afterEach(async ({ request }) => {
    await deleteSourcesByPrefix(request, 'e2e_').catch(() => {});
  });

  test('overview lists entities with counts and an export action', async ({ page }, testInfo) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration
    await expect(page.getByRole('heading', { name: 'Reference' })).toBeVisible();
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
    await page.goto('/reference/sources');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
    const initial = await page.locator('tbody tr').count();

    // Create — all required fields for a source row.
    await page.getByRole('button', { name: 'New source' }).click();
    await page.getByLabel('Code').fill(c);
    await page.getByLabel('Name').fill('E2E Source');
    await page.getByLabel('Published').fill('2025-01-01');
    await page.getByLabel('Author').fill('E2E Test');
    // Kind defaults to 'core' via the select's first option.
    await testInfo.attach('codex-create-form', { body: await page.screenshot(), contentType: 'image/png' });
    await page.locator('.modal-open').getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: c, exact: true })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(initial + 1);

    // Edit
    await page.locator('tbody tr', { hasText: c }).getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Name').fill('E2E Source Renamed');
    await page.locator('.modal-open').getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.getByRole('cell', { name: 'E2E Source Renamed', exact: true })).toBeVisible();

    // Delete (accept the confirm())
    page.on('dialog', (d) => d.accept());
    await page.locator('tbody tr', { hasText: c }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('tbody tr', { hasText: c })).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(initial);
  });

  test('soldier type: create (pool), edit name, delete', async ({ page }, testInfo) => {
    const name = `E2E Soldier ${Date.now()}`;
    await page.goto('/reference/soldier-types');
    await page.waitForLoadState('networkidle');
    const initial = await page.locator('tbody tr').count();

    // Open the new soldier type form
    await page.getByRole('button', { name: 'New soldier' }).click();
    await expect(page.getByRole('heading', { name: 'New soldier' })).toBeVisible();

    // Fill basic info
    await page.getByPlaceholder('e.g. Rifleman').fill(name);
    // Source defaults to the first option (The Silver Bayonet) — leave it
    // Cost
    await page.locator('input[min="0"][max="999"]').fill('15');

    // Stats — fill speed; leave others at 0
    const statInputs = page.locator('.grid input[type="number"]');
    await statInputs.first().fill('6');

    // Equipment mode: Pool
    await page.getByRole('button', { name: 'Pool', exact: true }).click();
    await page.locator('input[min="0"][max="20"]').first().fill('6');
    await page.locator('input[min="0"][max="20"]').nth(1).fill('2');

    await testInfo.attach('soldier-type-form', { body: await page.screenshot(), contentType: 'image/png' });
    await page.locator('.modal-open').getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('.modal-open')).toHaveCount(0);
    // Name cell includes a source-code badge, so match at the row level.
    await expect(page.locator('tbody tr').filter({ hasText: name })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(initial + 1);

    // Edit: rename
    await page.locator('tbody tr', { hasText: name }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit soldier' })).toBeVisible();
    await page.getByPlaceholder('e.g. Rifleman').fill(`${name} v2`);
    await page.locator('.modal-open').getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.locator('tbody tr').filter({ hasText: `${name} v2` })).toBeVisible();

    // Delete
    page.on('dialog', (d) => d.accept());
    await page.locator('tbody tr', { hasText: `${name} v2` }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('tbody tr', { hasText: `${name} v2` })).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(initial);
  });

  test('monster type: create, edit name, delete', async ({ page }, testInfo) => {
    const name = `E2E Monster ${Date.now()}`;
    await page.goto('/reference/monster-types');
    await page.waitForLoadState('networkidle');
    const initial = await page.locator('tbody tr').count();

    await page.getByRole('button', { name: 'New monster' }).click();
    await expect(page.getByRole('heading', { name: 'New monster' })).toBeVisible();

    await page.getByPlaceholder('e.g. Werewolf').fill(name);
    await page.getByLabel(/experience/i).fill('3');

    const statInputs = page.locator('.grid input[type="number"]');
    await statInputs.first().fill('5');

    await testInfo.attach('monster-type-form', { body: await page.screenshot(), contentType: 'image/png' });
    await page.locator('.modal-open').getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('.modal-open')).toHaveCount(0);
    // Name cell includes a source-code badge, so match at the row level.
    await expect(page.locator('tbody tr').filter({ hasText: name })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(initial + 1);

    // Edit: rename
    await page.locator('tbody tr', { hasText: name }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit monster' })).toBeVisible();
    await page.getByPlaceholder('e.g. Werewolf').fill(`${name} v2`);
    await page.locator('.modal-open').getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.modal-open')).toHaveCount(0);
    await expect(page.locator('tbody tr').filter({ hasText: `${name} v2` })).toBeVisible();

    // Delete
    page.on('dialog', (d) => d.accept());
    await page.locator('tbody tr', { hasText: `${name} v2` }).getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('tbody tr', { hasText: `${name} v2` })).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(initial);
  });

  test('surfaces a server-side error (duplicate code) in the form', async ({ page }) => {
    const c = code();
    await page.goto('/reference/sources');
    await page.waitForLoadState('networkidle'); // client fetches run post-hydration

    async function fillNew(name: string) {
      await page.getByRole('button', { name: 'New source' }).click();
      await page.getByLabel('Code').fill(c);
      await page.getByLabel('Name').fill(name);
      await page.getByLabel('Published').fill('2025-01-01');
      await page.getByLabel('Author').fill('E2E Test');
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
