import { type Page, expect, test } from '@playwright/test';
import { createUnit, openPicker } from './helpers.ts';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Expand the (collapsed-by-default) outside-nation recruit list in the builder. */
async function expandOutsideNation(soldiersCard: ReturnType<Page['locator']>) {
  const toggle = soldiersCard.getByRole('button', { name: /Outside-nation recruit/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

/** Open the Build options modal in the new-unit picker. */
async function openBuildOptions(page: Page) {
  await page.getByRole('button', { name: /Build options/ }).click();
}

// ── supplement filter ─────────────────────────────────────────────────────────

test.describe('build options — supplement filter', () => {
  test('all supplement nations are visible by default', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    // A supplement nation (Trading Companies, from the Canada supplement) shows by default
    await expect(
      page.locator('[role="button"].card').filter({
        has: page.locator('span.font-semibold', { hasText: /^Trading Companies$/ }),
      }),
    ).toBeVisible();
  });

  test('unchecking a supplement hides its nations and shows the customised badge', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    await page.locator('label').filter({ hasText: 'Canada' }).getByRole('checkbox').uncheck();

    // Canadian supplement nations disappear
    await expect(
      page.locator('[role="button"].card').filter({
        has: page.locator('span.font-semibold', { hasText: /^Trading Companies$/ }),
      }),
    ).not.toBeVisible();

    // Core nations are unaffected
    await expect(
      page.locator('[role="button"].card').filter({
        has: page.locator('span.font-semibold', { hasText: /^France$/ }),
      }),
    ).toBeVisible();

    // The "customised" badge appears on the Build options button
    await expect(page.getByRole('button', { name: 'Build options (customised)' })).toBeVisible();
  });

  test('re-checking a supplement restores its nations', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    const canadaCheckbox = page.locator('label').filter({ hasText: 'Canada' }).getByRole('checkbox');
    await canadaCheckbox.uncheck();
    await canadaCheckbox.check();

    await expect(
      page.locator('[role="button"].card').filter({
        has: page.locator('span.font-semibold', { hasText: /^Trading Companies$/ }),
      }),
    ).toBeVisible();
  });

  test('supplement restriction is recorded in the builder and shown as an indicator', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    await page.locator('label').filter({ hasText: 'Canada' }).getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Close' }).click();

    await page.locator('[role="button"].card')
      .filter({ has: page.locator('span.font-semibold', { hasText: /^France$/ }) })
      .click();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    // Supplement indicator appears near the nation — Canada is not listed, others are
    await expect(page.getByText(/Supplements:/)).toBeVisible();
    await expect(page.getByText(/Canada/)).not.toBeVisible();
  });
});

// ── outside-nation optional rule ──────────────────────────────────────────────

test.describe('build options — outside-nation soldier rule', () => {
  test('outside-nation soldier rule is on by default', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    await expect(
      page.locator('label').filter({ hasText: /outside-nation soldier/i }).getByRole('checkbox'),
    ).toBeChecked();
  });

  test('unchecking the rule shows the customised badge', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    await page.locator('label').filter({ hasText: /outside-nation soldier/i }).getByRole('checkbox').uncheck();

    await expect(page.getByRole('button', { name: 'Build options (customised)' })).toBeVisible();
  });

  test('outside-nation recruit section appears in the builder, collapsed by default', async ({ page }, testInfo) => {
    await createUnit(page, 'France');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    const toggle = soldiersCard.getByRole('button', { name: /Outside-nation recruit/ });
    await expect(toggle).toBeVisible();

    // Collapsed: no recruit buttons until expanded
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toContainText(/Show \d+/); // explicit cue that it expands
    await expect(soldiersCard.getByRole('button', { name: /\(outside nation\)$/ })).toHaveCount(0);
    await testInfo.attach('outside-nation-collapsed', {
      body: await soldiersCard.screenshot({ path: `test-results/screenshots/outside-nation-collapsed-${testInfo.project.name}.png` }),
      contentType: 'image/png',
    });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toContainText('Hide');
    await expect(soldiersCard.getByRole('button', { name: /\(outside nation\)$/ }).first()).toBeVisible();

    // And collapses again
    await toggle.click();
    await expect(soldiersCard.getByRole('button', { name: /\(outside nation\)$/ })).toHaveCount(0);
  });

  test('outside-nation recruit section is absent when the rule is disabled at creation', async ({ page }) => {
    await page.goto('/');
    await openPicker(page);

    await openBuildOptions(page);
    await page.locator('label').filter({ hasText: /outside-nation soldier/i }).getByRole('checkbox').uncheck();
    await page.getByRole('button', { name: 'Close' }).click();

    await page.locator('[role="button"].card')
      .filter({ has: page.locator('span.font-semibold', { hasText: /^France$/ }) })
      .click();
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await expect(soldiersCard.getByText('Outside-nation recruit')).not.toBeVisible();
  });

  test('can recruit one outside-nation soldier; member shows "outside nation" badge', async ({ page }) => {
    await createUnit(page, 'France');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await expandOutsideNation(soldiersCard);

    // At least one soldier is available as an outside-nation recruit
    const firstRecruitBtn = soldiersCard
      .getByRole('button', { name: /\(outside nation\)$/ })
      .first();
    await expect(firstRecruitBtn).toBeVisible();

    // Capture the soldier name from the aria-label before clicking
    const ariaLabel = (await firstRecruitBtn.getAttribute('aria-label')) ?? '';
    const soldierName = ariaLabel.replace(/^Recruit /, '').replace(/ \(outside nation\)$/, '');

    await firstRecruitBtn.click();

    // Member card appears with the "outside nation" warning badge
    const memberCard = page.locator('li').filter({
      has: page.locator(`[aria-label="Remove ${soldierName}"]`),
    });
    await expect(memberCard).toBeVisible();
    await expect(memberCard.getByText('outside nation')).toBeVisible();
  });

  test('only one outside-nation slot: recruit buttons disappear after the slot is filled', async ({ page }) => {
    await createUnit(page, 'France');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await expandOutsideNation(soldiersCard);
    await soldiersCard.getByRole('button', { name: /\(outside nation\)$/ }).first().click();

    // No more recruit buttons — the slot is filled
    await expect(
      soldiersCard.getByRole('button', { name: /\(outside nation\)$/ }),
    ).not.toBeVisible();
  });

  test('outside-nation member can be removed, restoring the recruit list', async ({ page }) => {
    await createUnit(page, 'France');

    const soldiersCard = page.locator('.card', { hasText: /^Soldiers/ });
    await expandOutsideNation(soldiersCard);

    const firstRecruitBtn = soldiersCard.getByRole('button', { name: /\(outside nation\)$/ }).first();
    const ariaLabel = (await firstRecruitBtn.getAttribute('aria-label')) ?? '';
    const soldierName = ariaLabel.replace(/^Recruit /, '').replace(/ \(outside nation\)$/, '');

    await firstRecruitBtn.click();

    // Remove via the − button in the outside-nation section
    await soldiersCard.getByRole('button', { name: 'Remove outside-nation soldier' }).click();

    // Recruit list reappears
    await expect(
      soldiersCard.getByRole('button', { name: /\(outside nation\)$/ }).first(),
    ).toBeVisible();

    // Member is gone
    await expect(
      page.locator('li').filter({ has: page.locator(`[aria-label="Remove ${soldierName}"]`) }),
    ).not.toBeVisible();
  });
});
