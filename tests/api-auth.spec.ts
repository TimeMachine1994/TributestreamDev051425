import { test, expect } from '@playwright/test';

test.describe('API Auth Endpoints', () => {
  test('POST /api/auth/login returns token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'testuser@example.com',
        password: 'testpassword'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.token).toBeDefined();
  });

  test('GET /api/auth/check returns user info', async ({ request }) => {
    const response = await request.get('/api/auth/check');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user).toBeDefined();
  });

  test('POST /api/auth/logout clears session', async ({ request }) => {
    const response = await request.post('/api/auth/logout');
    expect(response.ok()).toBeTruthy();
  });

  test('POST /api/auth/register creates user', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        email: 'newuser@example.com',
        password: 'newpassword',
        name: 'New User'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('newuser@example.com');
  });

  test('POST /api/auth/forgot-password sends email', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      data: {
        email: 'testuser@example.com'
      }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('POST /api/auth/reset-password updates password', async ({ request }) => {
    const response = await request.post('/api/auth/reset-password', {
      data: {
        code: 'dummy-reset-code',
        password: 'newpassword',
        passwordConfirmation: 'newpassword'
      }
    });
    expect(response.ok()).toBeTruthy();
  });
});