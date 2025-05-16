# Strapi User Fetch Implementation

## Overview

Added a helper `getCurrentUser` in [`src/lib/server/strapi/user.ts`](src/lib/server/strapi/user.ts:1) that uses the Strapi client’s `fetch` method to retrieve the authenticated user’s profile from the `/api/users/me` endpoint, including the `role` relation.

Updated the login API route at [`src/routes/api/auth/login/+server.ts`](src/routes/api/auth/login/+server.ts:1) to use this helper instead of a manual `fetch` call.

## Files Modified

- [`src/lib/server/strapi/user.ts`](src/lib/server/strapi/user.ts:1)

  ```typescript
  export async function getCurrentUser(jwt: string) {
    const user = await strapi.fetch('users/me?populate=role', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });
    return user;
  }
  ```

- [`src/routes/api/auth/login/+server.ts`](src/routes/api/auth/login/+server.ts:1)

  ```typescript
  import { getCurrentUser } from '$lib/server/strapi/user';

  // ...
  const fullUser = await getCurrentUser(data.jwt);
  // ...
  const responsePayload = JSON.stringify({
    ...data,
    user: fullUser
  });
  ```

## Usage

When a client sends login credentials to the `/api/auth/login` endpoint, the new `getCurrentUser` helper will fetch the full user record (including role) from Strapi, store it in an HTTP-only `user` cookie, and return the enriched user object in the API response.