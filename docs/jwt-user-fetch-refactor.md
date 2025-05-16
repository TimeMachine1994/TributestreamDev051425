# Refactor Plan: Fetch full user record after JWT verification

This document outlines steps to update our JWT auth logic so that:
- The JWT token is read from the `jwt` cookie.
- We verify the token, extract the user ID.
- We fetch the full user object from Strapi.
- We store that full user in `locals.user`.
- We update the `/my-portal` page server load to use the full user object including `role`.

---

## 1. Update `getUserFromToken` in [`src/lib/server/auth/jwt.ts:11`](src/lib/server/auth/jwt.ts:11)

1. Import the Strapi client at top of the file:
   ```ts
   import { strapi } from '$lib/server/strapi/client';
   ```
2. After verifying the JWT and extracting `payload` (around line 21), replace:
   ```ts
   return payload as unknown as User;
   ```
   with:
   ```ts
   // extract the numeric user ID from the payload
   const userId = (payload as any).id;
   // fetch the full user record from Strapi
   const fullUser = await strapi.findOne('users', userId);
   return fullUser ?? null;
   ```

---

## 2. Extract the `jwt` token from cookies in [`src/hooks.server.ts:1`](src/hooks.server.ts:1)

1. In your hook's `handle` function, get the raw cookie header:
   ```ts
   const cookieHeader = event.request.headers.get('cookie') ?? '';
   ```
2. Extract the JWT token from the `jwt` cookie:
   ```ts
   import { extractTokenFromCookie } from '$lib/server/auth/jwt';
   const jwtToken = extractTokenFromCookie(cookieHeader);
   ```
3. Call `getUserFromToken` and assign to `locals.user`:
   ```ts
   event.locals.user = jwtToken
     ? await getUserFromToken(jwtToken)
     : null;
   ```

---

## 3. Update `/my-portal` page load in [`src/routes/my-portal/+page.server.ts:6`](src/routes/my-portal/+page.server.ts:6)

1. Replace the existing load handler with:
   ```ts
   export const load: PageServerLoad = async ({ locals }) => {
     const user = locals.user;
     if (!user) throw redirect(302, '/login');

     const role = user.role;
     if (role === 'admin') throw redirect(302, '/admin');

     const validRoles = [
       'contributor',
       'funeral-director',
       'family-contact',
       'producer'
     ];
     if (!validRoles.includes(role)) {
       throw redirect(302, '/login');
     }

     const tributes = await strapi
       .collection('tributes')
       .find({ filters: { user: user.id } });

     return { user, tributes };
   };
   ```

---

## 4. Test the full authentication and authorization flow

- Log in to set the `jwt` cookie.
- Verify `getUserFromToken` returns the Strapi user object.
- Confirm redirects for missing user, `admin` role, and invalid roles.
- Ensure `tributes` load properly for valid roles.