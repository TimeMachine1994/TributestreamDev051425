---
title: JWT Expiration Handling Plan
---

# JWT Expiration Handling Plan

## Objective
Detect expired JWTs, clear the JWT cookie, and force user re-authentication.

## Steps

1. Update [`src/lib/server/auth/jwt.ts:1`](src/lib/server/auth/jwt.ts:1)
   - Import `errors` from `jose`
   - Create a `TokenExpiredError` class
   - In the `catch` block of `getUserFromToken`, detect `JWTExpired` and throw `TokenExpiredError`

2. Modify authentication hook or endpoints
   - In [`src/hooks.server.ts:1`](src/hooks.server.ts:1) or per-route handlers, call `getUserFromToken`
   - Catch `TokenExpiredError`
   - Delete the `jwt` cookie:
     ```ts
     event.cookies.delete('jwt', { path: '/' });
     ```
   - Redirect to login:
     ```ts
     throw redirect(303, '/login');
     ```

3. Update login API
   - Ensure fresh JWT issuance on successful login
   - Handle expired or missing tokens gracefully

4. Testing
   - Write unit tests for `getUserFromToken` with an expired token
   - Verify cookie deletion and redirect behavior in integration tests

## Code Examples

### TokenExpiredError Definition
```ts
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}
```

### Handling Expired Token in Hook
```ts
import { getUserFromToken, TokenExpiredError } from '$lib/server/auth/jwt';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const token = extractTokenFromCookie(event.request.headers.get('cookie') ?? '');

  try {
    event.locals.user = await getUserFromToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      event.cookies.delete('jwt', { path: '/' });
      throw redirect(303, '/login');
    }
    event.locals.user = null;
  }

  return resolve(event);
};
```

## Summary
By following this plan, expired tokens are caught, the JWT cookie is cleared, and users are redirected to log in again for a fresh session.