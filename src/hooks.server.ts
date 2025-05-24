import type { Handle } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/utils/auth';

export const handle: Handle = async ({ event, resolve }) => {
  // Extract JWT token
  const token = event.cookies.get('jwt');

  // Try to use cached user from cookie first for better performance
  const userCookie = event.cookies.get('user');
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch (err) {
      console.error('Error parsing user cookie:', err);
      user = token ? await getUserFromJwt(token, event) : null;
    }
  } else if (token) {
    user = await getUserFromJwt(token, event);
  }

  // Set user in locals for access in load functions
  event.locals.user = user;

  return await resolve(event);
};
