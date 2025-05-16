import { test, expect } from '@playwright/test';

test.describe('Celebration of Life Page', () => {
  test('Loads tribute page for valid slug', async ({ page }) => {
    await page.goto('/celebration-of-life-for-test-tribute');
    await expect(page.locator('h1')).toContainText('Test Tribute');
    await expect(page.locator('.tribute-description')).toBeVisible();
  });

  test('Shows 404 for invalid slug', async ({ page }) => {
    const response = await page.goto('/celebration-of-life-for-nonexistent-slug');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Not found');
  });

  test('Renders tribute content correctly', async ({ page }) => {
    await page.goto('/celebration-of-life-for-test-tribute');
    await expect(page.locator('.tribute-description')).toContainText('This is a test tribute.');
    await expect(page.locator('.tribute-media')).toBeVisible();
  });
});