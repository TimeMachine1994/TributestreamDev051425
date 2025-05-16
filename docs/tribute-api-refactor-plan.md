# Refactoring Plan: Tribute API Routes with SvelteKit 5 + Strapi

This document outlines the refactoring strategy for the following API route files to align with SvelteKit 5 idioms and centralized Strapi service logic:

- `src/routes/api/tributes/+server.ts`
- `src/routes/api/tributes/by-slug/[slug]/+server.ts`
- `src/routes/api/tributes/[id]/+server.ts`

---

## 🎯 Goals

- Use centralized logic from `lib/server/strapi/tribute.ts`
- Authenticate users via `getUserFromJwt()` from `lib/server/utils/auth.ts`
- Normalize JSON responses using `json()` from `@sveltejs/kit`
- Enforce ownership or admin role for mutations
- Improve error handling and logging

---

## 📁 `src/routes/api/tributes/+server.ts`

### GET
- Use `searchTributes(query, page, pageSize)`
- Extract query parameters from `url.searchParams`
- Return:
  ```ts
  {
    tributes: Tribute[],
    current_page: number,
    total_pages: number,
    total_items: number
  }
  ```

### POST
- Authenticate user via JWT from cookies
- Inject `user_id` into the payload
- Use `createTribute(data)`
- Return:
  ```ts
  { tribute: Tribute }
  ```

---

## 📁 `src/routes/api/tributes/by-slug/[slug]/+server.ts`

### GET
- Use `getTributeBySlug(slug)`
- Return:
  ```ts
  { tribute: Tribute }
  ```
- If not found, return:
  ```ts
  { error: 'Tribute not found' }
  ```

---

## 📁 `src/routes/api/tributes/[id]/+server.ts`

### GET
- Use `getTributeById(id)`
- Return:
  ```ts
  { tribute: Tribute }
  ```

### PUT
- Authenticate user via JWT
- Use `getTributeById(id)` to verify ownership or admin role
- Prevent `user_id` from being updated
- Use `updateTribute(id, data)`
- Return:
  ```ts
  { tribute: Tribute }
  ```

### DELETE
- Authenticate user via JWT
- Use `getTributeById(id)` to verify ownership or admin role
- Use `deleteTribute(id)`
- Return:
  ```ts
  { success: true }
  ```

---

## 🧼 Shared Improvements

- Use `json()` from `@sveltejs/kit` for all responses
- Normalize error messages and status codes
- Add logging via `lib/server/utils/logger.ts` if available
- Consider extracting common auth logic into a helper (e.g., `requireUser(cookies)`)