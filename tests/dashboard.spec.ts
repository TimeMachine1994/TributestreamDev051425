import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Dashboard layout renders with header and sidebar', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
  });

  test('Tribute list is visible on dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Tributes');
    await expect(page.locator('.tribute-card')).toHaveCount(1);
  });

  test('Clicking a tribute navigates to detail page', async ({ page }) => {
    const tributeLink = page.locator('.tribute-card a').first();
    const href = await tributeLink.getAttribute('href');
    await tributeLink.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('h1')).not.toBeEmpty();
  });

  test('Sidebar navigation works', async ({ page }) => {
    await page.click('nav >> text=Profile');
    await expect(page).toHaveURL('/dashboard/profile');
    await expect(page.locator('h1')).toContainText('Profile');
  });
});