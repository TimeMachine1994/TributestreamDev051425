import { describe, it, expect } from 'vitest';
import { buildStrapiQuery } from '../strapiQueryBuilder';

describe('buildStrapiQuery - Unit Tests', () => {
  it('builds query with filters', () => {
    const url = buildStrapiQuery('/api/items', {
      filters: {
        name: { eq: 'test' },
        count: { gte: 5 }
      }
    });
    expect(url).toContain('filters[name][eq]=test');
    expect(url).toContain('filters[count][gte]=5');
  });

  it('builds query with sort', () => {
    const url = buildStrapiQuery('/api/items', {
      sort: ['createdAt:desc', 'name:asc']
    });
    expect(url).toContain('sort=createdAt:desc,name:asc');
  });

  it('builds query with fields', () => {
    const url = buildStrapiQuery('/api/items', {
      fields: ['title', 'summary']
    });
    expect(url).toContain('fields=title');
    expect(url).toContain('fields=summary');
  });

  it('builds query with populate string', () => {
    const url = buildStrapiQuery('/api/items', {
      populate: '*'
    });
    expect(url).toContain('populate=*');
  });

  it('builds query with populate object', () => {
    const url = buildStrapiQuery('/api/items', {
      populate: { author: true }
    });
    expect(url).toContain('populate=%7B%22author%22%3Atrue%7D');
  });

  it('builds query with pagination', () => {
    const url = buildStrapiQuery('/api/items', {
      pagination: { page: 2, pageSize: 20 }
    });
    expect(url).toContain('pagination[page]=2');
    expect(url).toContain('pagination[pageSize]=20');
  });

  it('builds query with locale', () => {
    const url = buildStrapiQuery('/api/items', {
      locale: 'fr'
    });
    expect(url).toContain('locale=fr');
  });

  it('builds query with publicationState', () => {
    const url = buildStrapiQuery('/api/items', {
      publicationState: 'preview'
    });
    expect(url).toContain('publicationState=preview');
  });

  it('builds query with array filter values', () => {
    const url = buildStrapiQuery('/api/items', {
      filters: {
        tags: { in: ['news', 'tech'] }
      }
    });
    expect(url).toContain('filters[tags][in]=news');
    expect(url).toContain('filters[tags][in]=tech');
  });

  it('returns baseUrl when no options provided', () => {
    const url = buildStrapiQuery('/api/items');
    expect(url).toBe('/api/items?');
  });
});