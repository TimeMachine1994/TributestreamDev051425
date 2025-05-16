import type { Handle } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/server/utils/auth';

export const handle: Handle = async ({ event, resolve }) => {
    console.log('hooks.handle: incoming cookie header:', event.request.headers.get('cookie'));
    // extract JWT token (legacy jwt_token or new jwt)
    const token = event.cookies.get('jwt') ?? event.cookies.get('jwt_token');
    console.log('handle: token extracted from cookie:', token);
    // attempt to parse user cookie first
    const userCookie = event.cookies.get('user');
    console.log('handle: user cookie raw:', userCookie);
    let user = null;
    if (userCookie) {
      try {
        user = JSON.parse(userCookie);
      } catch (err) {
        console.error('handle: error parsing user cookie:', err);
        user = token ? await getUserFromJwt(token) : null;
      }
    } else if (token) {
      user = await getUserFromJwt(token);
    }
    console.log('handle: user resolved from cookie or JWT:', user);
    event.locals.user = user;
    return await resolve(event);
};
