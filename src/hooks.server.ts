import type { Handle } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/utils/auth';

export const handle: Handle = async ({ event, resolve }) => {
  console.log(`[hooks.server.ts] Processing request for path: ${event.url.pathname}, IsSubRequest: ${event.isSubRequest}`);

  // If the request is specifically for /api/auth/me, we bypass the hook's user population.
  // The /api/auth/me endpoint MUST handle its own authentication using the JWT from its request headers.
  if (event.url.pathname === '/api/auth/me') {
    console.log('[hooks.server.ts] Path is /api/auth/me. Skipping user population in hook for this request. Endpoint must use Authorization header.');
    return await resolve(event); // event.locals.user will be undefined (or default) for this specific request path
  }

  // For all other paths, proceed with existing user population logic:
  const token = event.cookies.get('jwt');
  const userCookie = event.cookies.get('user');
  let user = null;

  console.log(`[hooks.server.ts] Start. Token: ${token ? 'present' : 'absent'}, UserCookie: ${userCookie ? 'present' : 'absent'}`);

  if (userCookie) {
    console.log('[hooks.server.ts] Found userCookie. Content:', userCookie);
    try {
      const parsedUserFromCookie = JSON.parse(decodeURIComponent(userCookie));
      console.log(`[hooks.server.ts] Parsed user from cookie. Type: ${typeof parsedUserFromCookie}, Value: ${parsedUserFromCookie ? JSON.stringify(parsedUserFromCookie) : String(parsedUserFromCookie)}`);

      // Check if the parsed user is incomplete (e.g., lacks an id) and a token exists
      if ((!parsedUserFromCookie || !parsedUserFromCookie.id) && token && !event.isSubRequest) {
        console.log('[hooks.server.ts] User from cookie is incomplete, token exists, and not a sub-request. Attempting to fetch user from JWT.');
        user = await getUserFromJwt(token, event);
        console.log(`[hooks.server.ts] User from JWT (after incomplete cookie). Type: ${typeof user}, Value: ${user ? JSON.stringify(user) : String(user)}`);
      } else {
        // Use user from cookie if it's complete, no token, or if it's a sub-request
        user = parsedUserFromCookie;
        if (event.isSubRequest && (!parsedUserFromCookie || !parsedUserFromCookie.id) && token) {
          console.log('[hooks.server.ts] Sub-request: Using potentially incomplete user from cookie to avoid loop.');
        } else {
          console.log('[hooks.server.ts] Using user from cookie (complete, no token, or not needing JWT refresh).');
        }
      }
    } catch (err) {
      console.error('[hooks.server.ts] Error parsing user cookie:', err);
      console.log(`[hooks.server.ts] Attempting to fetch user from JWT due to cookie parse error. Token present: ${!!token}, Is sub-request: ${event.isSubRequest}`);
      if (token && !event.isSubRequest) {
        console.log('[hooks.server.ts] Calling getUserFromJwt (after cookie parse error, not a sub-request)...');
        user = await getUserFromJwt(token, event);
        console.log(`[hooks.server.ts] User from JWT (after cookie parse error). Type: ${typeof user}, Value: ${user ? JSON.stringify(user) : String(user)}`);
      } else {
        user = null;
        console.log(`[hooks.server.ts] No token, or is a sub-request. Not fetching user after cookie parse error. User set to null.`);
      }
    }
  } else if (token && !event.isSubRequest) {
    console.log('[hooks.server.ts] No userCookie, but found token and not a sub-request. Calling getUserFromJwt...');
    user = await getUserFromJwt(token, event);
    console.log(`[hooks.server.ts] User from JWT (no cookie). Type: ${typeof user}, Value: ${user ? JSON.stringify(user) : String(user)}`);
  } else {
    if (token && event.isSubRequest) {
      console.log('[hooks.server.ts] No userCookie, but is a sub-request with token. User remains null to avoid loop.');
    } else {
      console.log('[hooks.server.ts] No userCookie and no token. User remains null.');
    }
    // user is already null
  }

  event.locals.user = user;
  console.log(`[hooks.server.ts] Setting event.locals.user. Type: ${typeof user}, Value: ${user ? JSON.stringify(user) : String(user)}`);
  console.log('[hooks.server.ts] End.');

  return await resolve(event);
};
