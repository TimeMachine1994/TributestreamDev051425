# My Portal Route Debugging Summary

This document outlines the debugging process for the `my-portal` route, including the initial issues, analysis, fixes, verification plan, and recommendations for future improvements. It serves as a reference for ongoing development and maintenance.

---

## 1. Initial Issues Identified

- ❌ Users with valid JWT tokens were being redirected to the login page.
- ❌ Inconsistent rendering of portal components based on user roles.
- ❌ `my-portal` route was not properly handling expired or malformed tokens.
- ❌ Server-side load function was not returning expected user data.

---

## 2. Analysis Process and Findings

### 🔍 Investigation Steps

- Reviewed `+page.server.ts` and `+page.svelte` under `src/routes/my-portal/`.
- Logged JWT parsing and validation flow in `src/lib/server/auth/jwt.ts`.
- Verified role-based rendering logic in `+page.svelte`.
- Cross-checked Strapi user fetch logic in `src/lib/server/strapi/user.ts`.

### 🧠 Key Findings

- `getUserFromJwt()` was not throwing errors for expired tokens, leading to silent failures.
- `load()` in `+page.server.ts` was not returning `user` when token was invalid.
- `+page.svelte` expected `user` to always be defined, causing hydration mismatch.
- Role-based rendering logic was brittle and duplicated across components.

---

## 3. Implemented Fixes

### ✅ Fix 1: Improved JWT Validation

#### Before
```ts
const user = await getUserFromJwt(token); // silently failed
```

#### After
```ts
try {
  const user = await getUserFromJwt(token);
  if (!user) throw error(401, 'Unauthorized');
  return { user };
} catch (err) {
  console.error('JWT validation failed:', err);
  throw redirect(302, '/login');
}
```

### ✅ Fix 2: Defensive Rendering in +page.svelte

#### Before
```svelte
{#if user.role === 'admin'}
  <AdminPortal />
{/if}
```

#### After
```svelte
{#if user}
  {#if user.role === 'admin'}
    <AdminPortal />
  {:else if user.role === 'contributor'}
    <ContributorPortal />
  {:else}
    <p>Unknown role: {user.role}</p>
  {/if}
{:else}
  <p>Loading user data...</p>
{/if}
```

### ✅ Fix 3: Centralized Role Component Mapping

Created a utility to map roles to components to reduce duplication and improve maintainability.

---

## 4. Verification Plan

### ✅ Manual Test Scenarios

| Scenario | Expected Outcome |
|----------|------------------|
| Valid JWT, admin role | AdminPortal renders |
| Valid JWT, contributor role | ContributorPortal renders |
| Expired JWT | Redirect to login |
| No JWT | Redirect to login |
| Unknown role | Fallback message shown |

### ✅ Automated Tests

- Added unit tests for `getUserFromJwt()` with valid, expired, and malformed tokens.
- Added Playwright tests for `/my-portal` route with mocked roles.

---

## 5. Recommendations

- 🔐 Add token expiration handling in `getUserFromJwt()` with clear error messages.
- 🧪 Expand Playwright coverage for all portal roles.
- 🧼 Refactor role-based rendering into a dynamic component loader.
- 📦 Consider caching user role data in session to reduce Strapi calls.
- 🧭 Add loading and error states to improve UX during auth resolution.

---

📁 This document should be updated as further changes are made to the `my-portal` route.