# Server, Types, and Utils Summary

This document provides an overview of the contents of the `server`, `types`, and `utils` directories, along with any identified duplications or issues.

---

## 📁 `src/lib/server`

### `strapi/client.ts`
- Provides `getStrapiClient(event)` to create a Strapi client using JWT from cookies.
- Uses `@strapi/client` and `env.STRAPI_API_URL`.

### `strapi/tribute.ts`
- CRUD operations for `Tribute`:
  - `createTribute`
  - `getTributeById`
  - `getTributeBySlug`
  - `updateTribute`
  - `deleteTribute`
  - `searchTributes`
- Uses `getStrapiClient` and defines a `PaginationMeta` type.

### `strapi/user.ts`
- CRUD operations for `User`:
  - `createUser`
  - `getUserById`
  - `updateUser`
  - `deleteUser`
  - `getCurrentUser`
- Uses `getStrapiClient`.

---

## 📁 `src/lib/types`

### `tribute.ts`
```ts
export interface Tribute {
  id: number;
  attributes: TributeAttributes;
}
```
- Wraps Strapi-generated `ApiTributeTribute['attributes']`.

### `types.ts`
Defines multiple interfaces:
- `FdFormInput`: Funeral director form structure.
- `AuthError`: Custom error types.
- `User`: User model with optional role.
- `Tribute`: Custom tribute model (conflicts with `tribute.ts`).
- `FuneralHome`: Funeral home structure.

❗ **Issue**: Duplicate `Tribute` interface with different structure than in `tribute.ts`.

---

## 📁 `src/lib/utils`

### `auth-helpers.ts`
- `generateSecurePassword`
- `hashPassword`
- `convertMasterStoreToUserMeta`
- Defines a `User` interface (potential overlap with `types.ts`).

### `auth.ts`
- `setAuthCookies(jwt, maxAgeSeconds)`

### `email-service.ts`
- `sendCustomerConfirmation`
- `sendInternalNotification`
- Internal email template generators
- Uses SendGrid

### `form-validation.ts`
- `validateFuneralDirectorForm`
- `validateSimplifiedMemorialForm`
- Helpers: `isValidEmail`, `isValidPhone`, `isValidDate`
- Defines `ValidationResult`

### `jwt.ts`
- `TokenExpiredError` class
- `getUserFromToken`
- `extractTokenFromCookie`

### `string-helpers.ts`
- `createTributeSlug`
- `createTributeUrl`
- `formatName`

---

## ⚠️ Issues and Recommendations

### Duplicate `Tribute` Interface
- `src/lib/types/tribute.ts` vs `src/lib/types/types.ts`
- Recommendation: Rename one of the interfaces or consolidate them into a single source of truth.

### Potential Overlap: `User` Interface
- Defined in both `types.ts` and `auth-helpers.ts`.
- Recommendation: Centralize the `User` interface in `types.ts` and import it where needed.