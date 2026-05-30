import { expect, test } from '@playwright/test';

test.describe('units', () => {
  test('anonymous: build, persist to IndexedDB, reload, delete', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();
    await expect(page.getByText(/Stored on this device/i)).toBeVisible();

    await page.getByRole('button', { name: 'New unit' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

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

    // Delete it
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Delete The Night Watch/i }).click();
    await expect(page.getByText(/No units yet/i)).toBeVisible();
  });

  test('anonymous: nation picker + soldier roster persists', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New unit' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    // No nation yet → roster prompts to pick one
    await expect(page.getByText(/Pick a nation to choose soldiers/i)).toBeVisible();

    // Pick a nation (scoped by its placeholder, not position)
    const nationSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Choose a nation' }),
    });
    const franceValue = await nationSelect.locator('option', { hasText: 'France' }).getAttribute('value');
    await nationSelect.selectOption(franceValue!);

    // Add two Infantrymen via the soldier <select>
    const soldierSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Add a soldier' }),
    });
    const infantryValue = await soldierSelect
      .locator('option', { hasText: 'Infantryman' })
      .first()
      .getAttribute('value');
    const soldiersCard = page.locator('.card', { hasText: 'Soldiers' });
    for (let i = 0; i < 2; i++) {
      await soldierSelect.selectOption(infantryValue!);
      await soldiersCard.getByRole('button', { name: 'Add', exact: true }).click();
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

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    // Reload → nation + roster survive (IndexedDB)
    await page.reload();
    await expect(page.getByText('2 / 7')).toBeVisible();
    await expect(page.getByText('20 / 100')).toBeVisible();
    await expect(nationSelect).toHaveValue(/.+/);

    // Remove one → count + budget update
    await page.getByRole('button', { name: /Remove Infantryman/i }).first().click();
    await expect(page.getByText('1 / 7')).toBeVisible();
    await expect(page.getByText('10 / 100')).toBeVisible();

    // A max-1 soldier (Junior Officer) drops out of the add list once taken
    const joValue = await soldierSelect
      .locator('option', { hasText: 'Junior Officer' })
      .first()
      .getAttribute('value');
    await soldierSelect.selectOption(joValue!);
    await soldiersCard.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(soldierSelect.locator('option', { hasText: 'Junior Officer' })).toHaveCount(0);
  });

  test('anonymous: officer attributes + equipment, soldier pool equipment', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New unit' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    const nationSel = page.locator('select').filter({ has: page.locator('option', { hasText: 'Choose a nation' }) });
    const franceVal = await nationSel.locator('option', { hasText: 'France' }).getAttribute('value');
    await nationSel.selectOption(franceVal!);

    const officerCard = page.locator('.card', { hasText: 'Leader · free' });

    // Officer: pick exactly 2 attributes; a 3rd is then disabled
    await officerCard.getByRole('button', { name: 'Tactician', exact: true }).click();
    await officerCard.getByRole('button', { name: 'Strong', exact: true }).click();
    await expect(officerCard.getByText('2 / 2')).toBeVisible();
    await expect(officerCard.getByRole('button', { name: 'Nimble', exact: true })).toBeDisabled();

    // Officer: add a Musket (2 slots)
    const officerEquip = officerCard.locator('select');
    const musketValue = await officerEquip
      .locator('option', { hasText: 'Musket' })
      .first()
      .getAttribute('value');
    await officerEquip.selectOption(musketValue!);
    await officerCard.getByRole('button', { name: 'Add' }).click();
    await expect(officerCard.getByText(/Slots 2 \/ 6/)).toBeVisible();

    // Add a Veteran Hunter (pool mode → its own equipment builder + attribute pick)
    const soldiersCard = page.locator('.card', { hasText: 'Soldiers' });
    const addSoldier = soldiersCard
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'Add a soldier' }) });
    const vhValue = await addSoldier
      .locator('option', { hasText: 'Veteran Hunter' })
      .first()
      .getAttribute('value');
    await addSoldier.selectOption(vhValue!);
    await soldiersCard.getByRole('button', { name: 'Add', exact: true }).click();

    const vhCard = page.locator('li').filter({ has: page.locator('[aria-label="Remove Veteran Hunter"]') });
    await expect(vhCard.getByText(/Pick 1 attribute/)).toBeVisible();
    await expect(vhCard.getByText(/Slots 0 \/ 6/)).toBeVisible();

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
    await expect(officerCard.getByText('2 / 2')).toBeVisible();
    await expect(officerCard.getByText(/Slots 2 \/ 6/)).toBeVisible();
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
    await page.goto('/');
    await page.getByRole('button', { name: 'New unit' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);
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
    await page.goto('/');
    await page.getByRole('button', { name: 'New unit' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    await page.getByPlaceholder('The Night Watch').fill('Persist Test');

    // Pick France
    const nationSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Choose a nation' }),
    });
    const frVal = await nationSelect.locator('option', { hasText: 'France' }).getAttribute('value');
    await nationSelect.selectOption(frVal!);

    // Add an Infantryman
    const soldiersCard = page.locator('.card', { hasText: 'Soldiers' });
    const soldierSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Add a soldier' }),
    });
    const infantryValue = await soldierSelect
      .locator('option', { hasText: 'Infantryman' })
      .first()
      .getAttribute('value');
    await soldierSelect.selectOption(infantryValue!);
    await soldiersCard.getByRole('button', { name: 'Add', exact: true }).click();

    // Pick a special item for the Infantryman
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

    // Nation should still be France (the bug: select was blank after navigate-back)
    await expect(nationSelect).toHaveValue(/.+/);
    // Infantryman still in roster
    await expect(page.locator('li').filter({ has: page.locator('[aria-label="Remove Infantryman"]') })).toBeVisible();
    // Salt Bag special item should still be selected
    await expect(
      page.locator('li').filter({ has: page.locator('[aria-label="Remove Infantryman"]') }).getByRole('button', { name: 'Salt Bag' }),
    ).toHaveClass(/btn-primary/);
  });
});
