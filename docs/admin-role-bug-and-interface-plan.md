# Plan: Fix "Unknown role" Bug and Implement Admin Interface

## 1. Bug Diagnosis: "Unknown role"

### Observations
- Terminal logs show successful JWT verification and user fetch from Strapi.
- The user object includes fields like `id`, `username`, `email`, etc., but **no `role` field** is present.
- Frontend displays "Unknown role", indicating it expects a `role` field that is missing.

### Likely Cause
- The Strapi user fetch endpoint does not populate the `role` relation.
- The frontend logic relies on a `role` field to determine user interface behavior.

### Fix Plan
- Update the Strapi user fetch logic to include the `role` relation:
  - Modify the fetch call to use `populate=role` or equivalent.
- Ensure the mapped user object includes `role.name` or similar.
- Update frontend logic to handle the role correctly.

## 2. Admin Interface Implementation

### Requirements
- Create a new admin dashboard component.
- Display this component conditionally based on `user.role === 'admin'`.

### Implementation Plan
- Create a new Svelte component:
  - `src/lib/components/dashboard/AdminPortal.svelte`
- Add route logic to render this component for admin users.
- Optionally, add a route like `/dashboard/admin` or integrate into `/dashboard`.

## 3. Validation

- Add logging to confirm role is present in the mapped user object.
- Add test user with admin role in Strapi and verify frontend behavior.
- Confirm admin interface renders correctly.

## 4. Deliverables

- Bug fix in user fetch logic.
- New `AdminPortal.svelte` component.
- Conditional rendering logic in dashboard.
- This markdown plan.