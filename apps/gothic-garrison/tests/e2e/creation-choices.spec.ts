import { type Page, expect, test } from '@playwright/test';

// Venice supplement: attributes that ask for a choice at character creation.
// Elite Guard (Velite) — Grenadier (+1 Health, +1 Courage) or Chasseur (Light Infantry Training).
// Mercenary (Mercenary) — +1 to one of Melee / Accuracy / Defence / Courage / Health.

async function createUnit(page: Page, nation: string) {
  await page.goto('/');
  const opened = await page.getByRole('button', { name: 'Create' })
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (!opened) await page.getByRole('button', { name: 'New unit' }).click();
  await page.locator('[role="button"].card')
    .filter({ has: page.locator('span.font-semibold', { hasText: new RegExp(`^${nation}$`) }) })
    .click();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);
}

const memberCard = (page: Page, type: string) =>
  page.locator('li').filter({ has: page.locator(`[aria-label="Remove ${type}"]`) });

async function shot(
  page: Page,
  testInfo: import('@playwright/test').TestInfo,
  name: string,
  closeUp?: ReturnType<Page['locator']>,
) {
  await testInfo.attach(name, {
    body: await page.screenshot({
      path: `test-results/screenshots/${name}-${testInfo.project.name}.png`,
      fullPage: true,
    }),
    contentType: 'image/png',
  });
  // Close-up of the relevant card — the full builder page is very tall.
  if (closeUp) {
    await testInfo.attach(`${name}-card`, {
      body: await closeUp.screenshot({ path: `test-results/screenshots/${name}-card-${testInfo.project.name}.png` }),
      contentType: 'image/png',
    });
  }
}

test.describe('creation choices', () => {
  test('Velite: Elite Guard choice blocks save, applies stats, persists and prints', async ({ page }, testInfo) => {
    await createUnit(page, 'Kingdom of Italy');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await soldiersCard.getByRole('button', { name: 'Add Velite' }).click();

    const card = memberCard(page, 'Velite');
    const choice = card.getByTestId('creation-choice-Elite Guard');
    await expect(choice.getByText('Pick an option to continue.')).toBeVisible();

    // Saving without a choice is blocked with a clear message
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Velite needs an option chosen for Elite Guard.')).toBeVisible();

    // Chasseur first, then switch to Grenadier — only one option is ever selected
    await choice.getByRole('button', { name: 'Chasseur (Light Infantry Training)' }).click();
    await choice.getByRole('button', { name: /^Grenadier/ }).click();
    await expect(choice.getByRole('button', { name: /^Grenadier/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(choice.getByRole('button', { name: 'Chasseur (Light Infantry Training)' })).toHaveAttribute('aria-pressed', 'false');
    await expect(choice.getByText('Pick an option to continue.')).toHaveCount(0);

    await shot(page, testInfo, 'velite-elite-guard', card);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();
    await page.reload();
    await expect(
      memberCard(page, 'Velite').getByTestId('creation-choice-Elite Guard').getByRole('button', { name: /^Grenadier/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Print view: Velite base Health 12 / Courage +1 → 13 / +2, and the choice is listed
    await page.goto(page.url() + '/print');
    await expect(page.getByText('Elite Guard: Grenadier (+1 Health, +1 Courage)')).toBeVisible();
    const veliteTable = page.locator('table').filter({ hasText: 'Elite Guard: Grenadier' });
    const statRow = veliteTable.locator('tr').nth(3);
    await expect(statRow.locator('td').nth(4)).toHaveText('+2'); // Courage
    await expect(statRow.locator('td').nth(5)).toHaveText('13'); // Health
    await shot(page, testInfo, 'velite-print', veliteTable);
  });

  test('Mercenary: officer-style equipment + attribute pick, +1 stat choice', async ({ page }, testInfo) => {
    await createUnit(page, 'Venice');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await soldiersCard.getByRole('button', { name: 'Add Mercenary' }).click();

    const card = memberCard(page, 'Mercenary');
    // Equipped like an Officer (6 slots) with one officer attribute pick
    await expect(card.getByText(/Pick 1 attribute/)).toBeVisible();
    await expect(card.getByText('0 / 6')).toBeVisible();

    const choice = card.getByTestId('creation-choice-Mercenary');
    for (const label of ['+1 Melee', '+1 Accuracy', '+1 Defence', '+1 Courage', '+1 Health']) {
      await expect(choice.getByRole('button', { name: label, exact: true })).toBeVisible();
    }
    await choice.getByRole('button', { name: '+1 Defence', exact: true }).click();
    await expect(choice.getByRole('button', { name: '+1 Defence', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await shot(page, testInfo, 'mercenary-choice', card);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved ✓')).toBeVisible();

    await page.goto(page.url() + '/print');
    await expect(page.getByText('Mercenary: +1 Defence')).toBeVisible();
    const table = page.locator('table').filter({ hasText: 'Mercenary: +1 Defence' });
    await expect(table.locator('tr').nth(3).locator('td').nth(3)).toHaveText('14'); // Defence 13 → 14
  });
});
