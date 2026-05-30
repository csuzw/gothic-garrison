import { expect, test } from '@playwright/test';

const PETITE_POSTE = 'http://localhost:8025';

test.describe('password reset', () => {
  // Visual capture of both pages on desktop + phone. `?token=` makes the reset
  // page render its form (rather than the "open your email link" state).
  test('forgot/reset page screenshots', async ({ page }, testInfo) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /Reset password/i })).toBeVisible();
    await testInfo.attach('forgot-password', {
      body: await page.screenshot({
        path: `test-results/screenshots/forgot-password-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });

    await page.goto('/reset-password?token=preview-token');
    await expect(page.getByRole('heading', { name: /Choose a new password/i })).toBeVisible();
    await testInfo.attach('reset-password', {
      body: await page.screenshot({
        path: `test-results/screenshots/reset-password-${testInfo.project.name}.png`,
        fullPage: true,
      }),
      contentType: 'image/png',
    });
  });

  // End-to-end: register → request reset → follow the emailed link → set a new
  // password → sign in with it. Exercises the real mailer (via petite-poste).
  test('reset password via emailed link', async ({ page, request }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'WebKit drops Secure cookies over the http preview build',
    );

    const email = `e2e+reset-${Date.now()}@example.com`;
    const oldPassword = 'old-password-123';
    const newPassword = 'new-password-456';

    // Register (also signs in)
    await page.goto('/sign-up');
    await page.locator('input[autocomplete="name"]').fill('Reset Tester');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[autocomplete="new-password"]').fill(oldPassword);
    await page.getByRole('button', { name: /Create account/i }).click();
    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();

    // Sign out so we reset as a logged-out user
    await page.locator('details.dropdown-end > summary').click();
    await page.getByRole('button', { name: /Sign out/i }).click();
    await expect(page.getByRole('banner').getByRole('link', { name: /^Sign in$/i })).toBeVisible();

    // Request a reset link
    await page.goto('/forgot-password');
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole('button', { name: /Send reset link/i }).click();
    await expect(page.getByText(/reset link is on its way/i)).toBeVisible();

    // Pull the reset URL out of petite-poste (filter by our recipient + subject)
    let resetUrl: string | null = null;
    for (let i = 0; i < 20 && !resetUrl; i++) {
      const { emails } = await (await request.get(`${PETITE_POSTE}/api/inbox`)).json();
      const mail = emails.find((e: { to: string | string[]; subject: string; html?: string }) => {
        const to = Array.isArray(e.to) ? e.to.join(',') : e.to;
        return to.includes(email) && /reset/i.test(e.subject);
      });
      if (mail?.html) resetUrl = mail.html.match(/href="([^"]+)"/)?.[1] ?? null;
      if (!resetUrl) await page.waitForTimeout(250);
    }
    expect(resetUrl, 'reset email should arrive in petite-poste').toBeTruthy();

    // Follow the link → better-auth validates the token and redirects to our page
    await page.goto(resetUrl!);
    await expect(page).toHaveURL(/\/reset-password\?token=/);

    await page.locator('input[type="password"]').fill(newPassword);
    await page.getByRole('button', { name: /Reset password/i }).click();
    await expect(page.getByText(/password has been reset/i)).toBeVisible();

    // The new password works
    await page.goto('/sign-in');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(newPassword);
    await page.getByRole('button', { name: /^Sign in$/i }).click();
    await expect(page.getByRole('heading', { name: /Your units/i })).toBeVisible();
    await page.locator('details.dropdown-end > summary').click();
    await expect(page.locator('.dropdown-content').getByText(email)).toBeVisible();
  });
});
