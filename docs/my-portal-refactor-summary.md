# My Portal Refactor Summary

This document summarizes the refactoring steps applied to the `/my-portal` page and related components.

## 1. Server-side Load (`src/routes/my-portal/+page.server.ts`)

- Removed all Zod and `superValidate` imports and form initialization (`loginForm`, `resetForm`).
- Auth checks now rely exclusively on `locals.user` (set by hooks).
- Redirect logic:
  - Redirect unauthenticated users to `/login`.
  - Redirect users with `role === 'admin'` to `/admin`.
  - Validate roles against `['contributor', 'funeral-director', 'family-contact', 'producer']`; invalid roles also redirect to `/login`.
- Replaced raw `fetch` with the Strapi client helper to load tributes:
  ```ts
  const tributes = await strapi.collection('tributes').find({
    filters: { user: user.id }
  });
  ```
- Returned only `{ user, tributes }` from the `load` function.

## 2. Client-side Page Component (`src/routes/my-portal/+page.svelte`)

- Removed imports and usage of `SuperValidated`, `loginForm`, and `resetForm`.
- Updated `PageData` to include only:
  ```ts
  interface PageData {
    user: { id: string; name: string; email: string; role: string };
    tributes: Tribute[];
  }
  ```
- Simplified script to:
  ```ts
  let { data } = $props<{ data: PageData }>();
  ```
- Removed `showForgotPassword` state and all unauthenticated rendering branches.
- Simplified template to always render the authenticated view:
  - Kept `<PageBackground>` and the gradient overlay.
  - Preserved header, welcome message, and logout form.
  - Rendered role-specific portal components based on `data.user.role`:
    ```svelte
    {#if data.user.role === 'contributor'}
      <ContributorPortal {tributes} />
    {:else if data.user.role === 'funeral-director'}
      <FuneralDirectorPortal {tributes} />
    {:else if data.user.role === 'family-contact'}
      <FamilyContactPortal {tributes} />
    {:else if data.user.role === 'producer'}
      <ProducerPortal {tributes} />
    {:else}
      <p class="text-red-600">Unknown role: {data.user.role}</p>
    {/if}
    ```
- Passed `tributes={data.tributes}` into each portal component.
- Maintained dynamic `<svelte:head>` title based on `data.user.name`.

## 3. Dashboard Portal Components

Applied to each of:
- `src/lib/components/dashboard/ContributorPortal.svelte`
- `src/lib/components/dashboard/FuneralDirectorPortal.svelte`
- `src/lib/components/dashboard/FamilyContactPortal.svelte`
- `src/lib/components/dashboard/ProducerPortal.svelte`

Changes:
- Added at top of file:
  ```svelte
  <script lang="ts">
    import type { Tribute } from '$lib/types/tribute';
    import TributeList from '$lib/components/tributes/tribute-grid.svelte';
    export let tributes: Tribute[];
    // (existing imports and logic kept)
  </script>
  ```
- Below the existing portal UI, inserted:
  ```svelte
  <section class="mt-6">
    <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
    <TributeList items={tributes} />
  </section>
  ```

All other code and modules remain unchanged.