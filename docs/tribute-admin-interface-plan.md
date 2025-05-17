# Tribute Administration Interface Implementation Plan

This document outlines the steps to implement a "Review Content" feature in the Admin Portal, enabling tribute administration with search, listing, and editing capabilities using SvelteKit 5 runes and server load functions.

---

## 1. Update Admin Portal UI

**File:** `src/lib/components/my-portal/AdminPortal.svelte`

- Add a button or link labeled "Review Tribute Content"
- Route it to `/my-portal/tributes`

```svelte
<a href="/my-portal/tributes" class="button">📋 Review Tribute Content</a>
```

---

## 2. Create Tribute Admin Page

**Files:**
- `src/routes/my-portal/tributes/+page.svelte`
- `src/routes/my-portal/tributes/+page.server.ts`

### +page.server.ts
- Fetch tribute data from Strapi using `getAllTributes()` from `src/lib/server/strapi/tribute.ts`
- Accept optional search query via `url.searchParams.get('q')`

### +page.svelte
- Use `$state` for search input
- Use `$effect` to debounce and trigger search
- Display tribute list using `tribute-card.svelte` or a new `TributeAdminList.svelte`
- Add "Edit" button linking to `/my-portal/tributes/[id]/edit`

---

## 3. Create Tribute Edit Page

**Files:**
- `src/routes/my-portal/tributes/[id]/edit/+page.svelte`
- `src/routes/my-portal/tributes/[id]/edit/+page.server.ts`

### +page.server.ts
- Load tribute by ID from Strapi

### +page.svelte
- Use `tribute-form.svelte` to edit tribute
- Submit updates via form action or API

---
 

## 5. Component Reuse

- Reuse `tribute-card.svelte` for display
- Reuse `tribute-form.svelte` for editing
- Consider creating:
  - `TributeAdminList.svelte`
  - `SearchBar.svelte`

---

## 6. Permissions

- Ensure only admin users can access `/admin/tributes` and `/admin/tributes/[id]/edit`
- Use `load` guards or server-side checks

---
 