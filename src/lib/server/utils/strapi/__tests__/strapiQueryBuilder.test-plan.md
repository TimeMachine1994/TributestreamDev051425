# Test Plan for `buildStrapiQuery`

This document outlines the test strategy for the `buildStrapiQuery` function located in `frontend/src/lib/server/utils/strapi/strapiQueryBuilder.ts`.

## ✅ Purpose

The `buildStrapiQuery` function constructs a Strapi-compatible query string from a base URL and a set of query options. It supports:

- Filters
- Sorting
- Field selection
- Population
- Pagination
- Locale
- Publication state

## 🧪 Test Strategy

We will use Vitest as the testing framework. The test file will be located at:

```
frontend/src/lib/server/utils/strapi/__tests__/strapiQueryBuilder.test.ts
```

## 🧪 Test Cases

| Test Case | Description |
|----------|-------------|
| ✅ Basic URL | Should return the base URL with no query params if no options are provided |
| ✅ Filters | Should encode filters correctly using nested keys |
| ✅ Sort | Should handle both string and array sort values |
| ✅ Fields | Should append multiple `fields` parameters |
| ✅ Populate | Should handle string and object values for populate |
| ✅ Pagination | Should encode pagination keys correctly |
| ✅ Locale | Should append locale |
| ✅ Publication State | Should append publicationState |
| ✅ Combined | Should handle all options together correctly |

## 🧪 Example Test Case

```ts
import { buildStrapiQuery } from '../strapiQueryBuilder';

describe('buildStrapiQuery', () => {
  it('should return base URL if no options are provided', () => {
    expect(buildStrapiQuery('http://api.test')).toBe('http://api.test?');
  });

  it('should encode filters correctly', () => {
    const url = buildStrapiQuery('http://api.test', {
      filters: {
        name: { eq: 'John' },
        age: { gte: 18 }
      }
    });
    expect(url).toContain('filters[name][eq]=John');
    expect(url).toContain('filters[age][gte]=18');
  });

  // Additional tests for sort, fields, populate, pagination, etc.
});
```

## 🧪 Notes

- Use `URLSearchParams` to parse and verify query strings in tests.
- Consider edge cases like empty arrays, null values, and deeply nested populate objects.
# strapiQueryBuilder Vitest Plan

This test suite verifies the behavior of `buildStrapiQuery` for various Strapi collection types.

## ✅ API Under Test

```ts
buildStrapiQuery(baseUrl: string, options: QueryOptions): string
```

## ✅ QueryOptions

- `filters`: field → operator → value
- `sort`: string | string[]
- `fields`: string[]
- `populate`: string | string[] | object
- `pagination`: { page, pageSize, start, limit }
- `locale`: string
- `publicationState`: 'live' | 'preview'

---

## 🔬 Test Coverage by Collection Type

### 1. FdFormInput

- [ ] filters by `email` and `phone`
- [ ] filters by `memorialDate`
- [ ] sort by `memorialDate`

### 2. Tribute

- [ ] filters by `slug`
- [ ] filters by `status`
- [ ] populates `owner`
- [ ] pagination with `page` and `pageSize`

### 3. FuneralHome

- [ ] filters by `city` and `zipCode`
- [ ] populates `directors`
- [ ] sort by `name`

### 4. User

- [ ] filters by `email` and `username`
- [ ] populates `role`
- [ ] filters by `role.type`

---

## 🧪 Example Test Case

```ts
it('builds query for Tribute with slug and owner population', () => {
  const query = buildStrapiQuery('/api/tributes', {
    filters: { slug: { eq: 'john-doe' } },
    populate: ['owner']
  });

  expect(query).toContain('filters[slug][eq]=john-doe');
  expect(query).toContain('populate=owner');
});
```