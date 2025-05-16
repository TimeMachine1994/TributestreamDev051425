import { test, expect } from '@playwright/test';

test.describe('Tribute Management', () => {
  let tributeId: string;

  test('Create tribute via API', async ({ request }) => {
    const response = await request.post('/api/tributes', {
      data: {
        title: 'Test Tribute',
        slug: 'test-tribute',
        description: 'This is a test tribute.'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    tributeId = body.id;
    expect(body.title).toBe('Test Tribute');
  });

  test('Fetch tribute by ID', async ({ request }) => {
    const response = await request.get(`/api/tributes/${tributeId}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.id).toBe(tributeId);
  });

  test('Fetch tribute by slug', async ({ request }) => {
    const response = await request.get(`/api/tributes/by-slug/test-tribute`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.slug).toBe('test-tribute');
  });

  test('Update tribute', async ({ request }) => {
    const response = await request.put(`/api/tributes/${tributeId}`, {
      data: {
        title: 'Updated Tribute Title'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.title).toBe('Updated Tribute Title');
  });

  test('Delete tribute', async ({ request }) => {
    const response = await request.delete(`/api/tributes/${tributeId}`);
    expect(response.ok()).toBeTruthy();
  });
});