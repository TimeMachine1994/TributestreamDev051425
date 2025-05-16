import { describe, it, expect } from 'vitest';
import { buildStrapiQuery } from '../strapiQueryBuilder';
import {env } from '$env/dynamic/private';
 
const STRAPI_URL = env.STRAPI_URL || 'http://localhost:1337';
const ADMIN_API_KEY = env.STRAPI_ADMIN_API_KEY;

async function fetchStrapi(path: string) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${ADMIN_API_KEY}`
    }
  });
  const json = await res.json();
  return { status: res.status, json };
}

describe('strapiQueryBuilder - Integration Tests', () => {
  it('fetches tribute by slug and populates owner', async () => {
    const query = buildStrapiQuery('/api/tributes', {
      filters: {
        slug: { eq: 'john-doe' }
      },
      populate: ['owner']
    });

    const { status, json } = await fetchStrapi(query);
    expect(status).toBe(200);
    expect(json.data).toBeDefined();
    if (json.data.length > 0) {
      expect(json.data[0].attributes.slug).toBe('john-doe');
      expect(json.data[0].attributes.owner).toBeDefined();
    }
  });

  it('fetches users filtered by email and populates role', async () => {
    const query = buildStrapiQuery('/api/users', {
      filters: {
        email: { eq: 'admin@example.com' }
      },
      populate: ['role']
    });

    const { status, json } = await fetchStrapi(query);
    expect(status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    if (json.length > 0) {
      expect(json[0].email).toBe('admin@example.com');
      expect(json[0].role).toBeDefined();
    }
  });
});