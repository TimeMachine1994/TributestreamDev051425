# 🧩 Tribute Admin Interface Enhancement Plan

## Goal

Enable the `/my-portal/admin/tributes` route to:
- Display a searchable list of tributes
- Link to an edit page for each tribute

Enable the `/my-portal/admin/tributes/edit-tribute-[id]` route to:
- Display a form with all editable tribute fields
- Submit updates to the backend

---

## Phase 1: ✅ Confirm Tribute Listing Functionality

- [x] Confirm `+page.server.ts` loads tributes via `searchTributes()`
- [x] Confirm `+page.svelte` renders tribute list using `<TributeCard>`
- [x] Confirm search input updates query param and triggers reload
- [x] Confirm each tribute has an "Edit" button linking to the edit page

📝 Status: Already implemented and functional

---

## Phase 2: 🛠️ Improve Tribute Edit Page

### 2.1: Ensure All Fields Are Editable
- [ ] Confirm `TributeForm.svelte` supports all editable fields (name, dates, obituary, etc.)
- [ ] If not, update `TributeForm.svelte` to include missing fields
- [ ] Ensure form uses two-way binding and emits `submit` event with updated data

### 2.2: Improve Edit Page UX
- [ ] Add heading and navigation (e.g., "Back to list")
- [ ] Show loading/error states if tribute fails to load
- [ ] Show success/failure feedback after submission

---

## Phase 3: 🔄 Wire Up Tribute Update API

- [ ] Confirm `/api/tributes/[id]/+server.ts` supports PUT requests
- [ ] Ensure it validates and updates tribute data in Strapi
- [ ] Add error handling and validation feedback in edit page

---

 