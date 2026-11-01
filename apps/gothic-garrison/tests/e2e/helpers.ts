import { type Page, expect } from '@playwright/test';

/**
 * Open the new-unit nation picker if it isn't already open.
 *
 * The home page auto-opens the picker (`pickerOpen = true`) once it has found
 * there are no saved units, which happens after hydration + an IndexedDB read
 * and can take several seconds on a slow CI WebKit runner. "New unit" toggles
 * the picker, so a fixed wait-then-click races with the auto-open and can
 * leave it closed. Instead, converge: whenever it isn't open, click and
 * re-check, until it is. The auto-open only ever sets it open, so this settles.
 */
export async function openPicker(page: Page) {
  const create = page.getByRole('button', { name: 'Create' });
  await expect(async () => {
    if (!(await create.isVisible())) await page.getByRole('button', { name: 'New unit' }).click();
    await expect(create).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20_000 });
}

/** Go home, open the nation picker, pick a nation, click Create. */
export async function createUnit(page: Page, nation = 'France') {
  await page.goto('/');
  await openPicker(page);
  // Match the nation card's exact title so nations whose descriptions mention
  // other nations (e.g. Spain mentioning "French") don't satisfy a hasText filter.
  await page.locator('[role="button"].card')
    .filter({ has: page.locator('span.font-semibold', { hasText: new RegExp(`^${nation}$`) }) })
    .click();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/units\/[0-9a-f-]+$/i);
}
