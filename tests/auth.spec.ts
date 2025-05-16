import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Login with valid credentials sets auth cookie', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'auth');
    expect(authCookie).toBeDefined();
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('GET /api/auth/check returns user info when logged in', async ({ request }) => {
    const response = await request.get('/api/auth/check');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBeDefined();
  });

  test('Logout clears auth cookie', async ({ page }) => {
    await page.goto('/logout');
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'auth');
    expect(authCookie).toBeUndefined();
  });
});