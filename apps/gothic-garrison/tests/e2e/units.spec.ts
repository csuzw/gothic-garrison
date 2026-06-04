import { type Page, expect, test } from '@playwright/test';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Open the new-unit nation picker if it isn't already open. */
async function openPicker(page: Page) {
  // Picker auto-opens when there are no units; only click when it's closed.
  const isOpen = await page.getByRole('button', { name: 'Create' }).isVisible();
  if (!isOpen) await page.getByRole('button', { name: 'New unit' }).click();
}

/** Open the new-unit nation picker, pick a nation, click Create. */
async function createUnit(page: Page, nation = 'France') {
  await page.goto('/');
  await openPicker(page);
  // Use the span.font-semibold inside each nation card for an exact name match so
  // nations whose descriptions mention other nations (e.g. Spain mentioning "French")
  // don't accidentally satisfy a plain hasText filter.
  await page.locator('[role="button"].card')
    .filter({ has: page.locator('span.font-semibold', { hasText: new RegExp(`^${nation}$`) }) })
    .click();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);
}

/** Expand the soldier picker tile list if it is currently collapsed. */
async function expandSoldierPicker(soldiersCard: ReturnType<Page['locator']>) {
  const editBtn = soldiersCard.getByRole('button', { name: 'Edit' });
  if (await editBtn.isVisible()) await editBtn.click();
}

// ── tests ────────────────────────────────────────────────────────────────────

test.describe('units', () => {
  test('anonymous: build, persist to IndexedDB, reload, delete', async ({ page }, testInfo) => {
    await createUnit(page);

    // Budget starts at the base 100
    await expect(page.getByText('0 / 100')).toBeVisible();

    await page.getByPlaceholder('The Night Watch').fill('The Night Watch');
    await page.getByPlaceholder('Capitaine Renaud').fill('Capitaine Renaud');

    // +5 Recruitment bumps the budget live
    await page.getByRole('radio', { name: '+5 Recruitment' }).click();
    await expect(page.getByText('0 / 105')).toBeVisible();

    await testInfo.attach('builder', {
      body: await page.screenshot({
        path: `test-results/screenshots/unit-builder-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    // Reload → values survive (read back from IndexedDB)
    await page.reload();
    await expect(page.getByPlaceholder('The Night Watch')).toHaveValue('The Night Watch');
    await expect(page.getByText('0 / 105')).toBeVisible();

    // Shows up in the list (home)
    await page.goto('/');
    await expect(page.getByText('The Night Watch')).toBeVisible();

    // Delete with inline confirmation (no browser dialog — pendingDeleteId pattern)
    await page.getByRole('button', { name: /Delete The Night Watch/i }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText(/No units yet/i)).toBeVisible();
  });

  test('anonymous: nation picker + soldier roster persists', async ({ page }, testInfo) => {
    await createUnit(page, 'France');

    // Nation is shown read-only in the builder
    await expect(page.getByText('France')).toBeVisible();

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });

    // Soldier picker opens automatically for a new unit (no members yet)
    // Add two Infantrymen via the tile + button
    for (let i = 0; i < 2; i++) {
      await soldiersCard.getByRole('button', { name: 'Add Infantryman' }).click();
    }

    await expect(page.getByText('2 / 7')).toBeVisible();
    // Two Infantrymen @10 pts on the default 100-pt budget
    await expect(page.getByText('20 / 100')).toBeVisible();

    await testInfo.attach('roster', {
      body: await page.screenshot({
        path: `test-results/screenshots/unit-roster-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    // Reload → nation + roster survive (IndexedDB)
    await page.reload();
    await expect(page.getByText('2 / 7')).toBeVisible();
    await expect(page.getByText('20 / 100')).toBeVisible();
    await expect(page.getByText('France')).toBeVisible();

    // Remove one via the member card Remove button
    await page.getByRole('button', { name: /Remove Infantryman/i }).first().click();
    await expect(page.getByText('1 / 7')).toBeVisible();
    await expect(page.getByText('10 / 100')).toBeVisible();

    // A max-1 soldier (Junior Officer): after adding, its + tile button becomes disabled
    await expandSoldierPicker(soldiersCard);
    await soldiersCard.getByRole('button', { name: 'Add Junior Officer' }).click();
    await expect(soldiersCard.getByRole('button', { name: 'Add Junior Officer' })).toBeDisabled();
  });

  test('anonymous: officer attributes + equipment, soldier pool equipment', async ({
    page,
  }, testInfo) => {
    await createUnit(page, 'France');

    const officerCard = page.locator('.card', { hasText: 'Leader · free' });

    // Officer: pick exactly 2 attributes; a 3rd is then disabled
    await officerCard.getByRole('button', { name: 'Tactician', exact: true }).click();
    await officerCard.getByRole('button', { name: 'Strong', exact: true }).click();
    await expect(officerCard.getByText('2 / 2')).toBeVisible();
    await expect(officerCard.getByRole('button', { name: 'Nimble', exact: true })).toBeDisabled();

    // Officer: equipment browser opens expanded for a new unit — add a Musket (2 slots)
    await officerCard.getByRole('button', { name: 'Add Musket' }).click();
    await expect(officerCard.getByText('2 / 6')).toBeVisible();

    // Add a Veteran Hunter (pool mode → its own equipment browser + attribute pick)
    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await soldiersCard.getByRole('button', { name: 'Add Veteran Hunter' }).click();

    const vhCard = page.locator('li').filter({ has: page.locator('[aria-label="Remove Veteran Hunter"]') });
    await expect(vhCard.getByText(/Pick 1 attribute/)).toBeVisible();
    // VH equipment browser is open (no pool items yet) — shows Slots 0 / 6
    await expect(vhCard.getByText('0 / 6')).toBeVisible();

    await testInfo.attach('builder-full', {
      body: await page.screenshot({
        path: `test-results/screenshots/unit-full-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });

    // Save + reload → officer choices and roster survive
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();
    await page.reload();

    // Officer attributes still selected (2/2)
    await expect(officerCard.getByText('2 / 2')).toBeVisible();

    // Officer equipment browser is collapsed after reload (has items) — expand to verify slots
    await officerCard.getByRole('button', { name: 'Edit' }).click();
    await expect(officerCard.getByText('2 / 6')).toBeVisible();

    // VH still in roster
    await expect(page.locator('li').filter({ has: page.locator('[aria-label="Remove Veteran Hunter"]') })).toBeVisible();
  });

  test('signed-in: unit persists to the server', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'WebKit drops Secure cookies over the http preview build',
    );

    const email = `e2e+wb-${Date.now()}@example.com`;
    await page.goto('/sign-up');
    await page.locator('input[autocomplete="name"]').fill('WB Tester');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[autocomplete="new-password"]').fill('test-password-123');
    await page.getByRole('button', { name: /Create account/i }).click();
    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();

    await expect(page.getByText(/Synced to your account/i)).toBeVisible();
    await page.getByRole('button', { name: 'New unit' }).click();
    await page.locator('[role="button"].card')
      .filter({ has: page.locator('span.font-semibold', { hasText: /^France$/ }) })
      .click();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    await page.getByPlaceholder('The Night Watch').fill('Server Unit');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    // Reload → read back from the server
    await page.reload();
    await expect(page.getByPlaceholder('The Night Watch')).toHaveValue('Server Unit');

    await page.goto('/');
    await expect(page.getByText('Server Unit')).toBeVisible();
  });

  test('anonymous unit migrates to the account on sign-up', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'WebKit drops Secure cookies over the http preview build',
    );

    // Build a unit while anonymous (lands in IndexedDB)
    await createUnit(page, 'France');
    await page.getByPlaceholder('The Night Watch').fill('Migrated Band');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText(/Stored on this device/i)).toBeVisible();
    await expect(page.getByText('Migrated Band')).toBeVisible();

    // Sign up → migration runs, lands on the synced list (home)
    const email = `e2e+migrate-${Date.now()}@example.com`;
    await page.goto('/sign-up');
    await page.locator('input[autocomplete="name"]').fill('Migrator');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[autocomplete="new-password"]').fill('test-password-123');
    await page.getByRole('button', { name: /Create account/i }).click();

    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();
    await expect(page.getByText(/Synced to your account/i)).toBeVisible();
    await expect(page.getByText('Migrated Band')).toBeVisible();

    // Reload → it's genuinely on the server now
    await page.reload();
    await expect(page.getByText('Migrated Band')).toBeVisible();

    // Sign out → the local IndexedDB copy was cleared (no anonymous dupe left)
    await page.locator('details.dropdown-end > summary').click();
    await page.getByRole('button', { name: /Sign out/i }).click();
    await expect(page.getByRole('banner').getByRole('link', { name: /^Sign in$/i })).toBeVisible();
    await page.goto('/');
    await expect(page.getByText(/No units yet/i)).toBeVisible();
  });

  test('anonymous: nation + special equipment persist on navigate-away and back', async ({
    page,
  }) => {
    await createUnit(page, 'France');

    await page.getByPlaceholder('The Night Watch').fill('Persist Test');

    // Nation is shown in the builder (read-only, set from home page picker)
    await expect(page.getByText('France')).toBeVisible();

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });

    // Add an Infantryman via tile + button (picker starts open for new unit)
    await soldiersCard.getByRole('button', { name: 'Add Infantryman' }).click();

    // Pick a special item for the Infantryman (button-toggle in the member card)
    const soldierItem = page.locator('li').filter({ has: page.locator('[aria-label="Remove Infantryman"]') });
    await soldierItem.getByRole('button', { name: 'Salt Bag' }).click();
    await expect(soldierItem.getByRole('button', { name: 'Salt Bag' })).toHaveClass(/btn-primary/);

    // Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    // Client-side navigate away (← Units link) then back via the home page list
    await page.getByRole('link', { name: '← Units' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: 'Persist Test' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    // Wait for doc to load
    await expect(page.getByPlaceholder('The Night Watch')).toHaveValue('Persist Test');

    // Nation still shows France
    await expect(page.getByText('France')).toBeVisible();
    // Infantryman still in roster
    await expect(page.locator('li').filter({ has: page.locator('[aria-label="Remove Infantryman"]') })).toBeVisible();
    // Salt Bag special item should still be selected
    await expect(
      page.locator('li').filter({ has: page.locator('[aria-label="Remove Infantryman"]') }).getByRole('button', { name: 'Salt Bag' }),
    ).toHaveClass(/btn-primary/);
  });
});
