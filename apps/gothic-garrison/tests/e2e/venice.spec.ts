import { expect, test } from '@playwright/test';

// Venice supplement content outside the unit builder: the Alchemical
// Concoctions cheat-sheet section and the bestiary in the Reference browser.

test.describe('Venice supplement', () => {
  test('cheat sheet lists the alchemical concoctions', async ({ page }, testInfo) => {
    await page.goto('/cheat-sheet');

    const rules = page.locator('section', { has: page.getByRole('heading', { name: /Alchemical Concoctions/ }) });
    await expect(rules.getByText('venice:55')).toBeVisible();
    await expect(rules.getByText('Alchemical Healing')).toBeVisible();

    const list = page.locator('section', { has: page.getByRole('heading', { name: /Concoction List/ }) });
    for (const name of ['Poison', 'Fire (Greek Fire)', 'Metallurgy', 'Salt', 'Sulphur', 'Acid Shot', 'Powder', 'Freezing Shot']) {
      await expect(list.getByRole('cell', { name, exact: true })).toBeVisible();
    }

    for (const [label, section] of [['concoctions-rules', rules], ['concoctions-list', list]] as const) {
      await testInfo.attach(label, {
        body: await section.screenshot({ path: `test-results/screenshots/${label}-${testInfo.project.name}.png` }),
        contentType: 'image/png',
      });
    }
  });

  test('bestiary monsters appear in the Reference browser', async ({ page }) => {
    await page.goto('/reference/monster-types');
    for (const name of ['Bravo Brawler', 'Canal Serpent', 'Count Monterosso', 'Lion Statue Golem', 'Wreckbound']) {
      // The name cell also carries the source tag, e.g. "Canal Serpent venice".
      await expect(page.getByRole('cell', { name: `${name} venice`, exact: true })).toBeVisible();
    }
  });
});
