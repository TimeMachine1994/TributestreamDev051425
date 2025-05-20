import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/strapi/user';

export const POST: RequestHandler = async (event) => {
  const { request, cookies } = event;
  try {
    const body = await request.json();

    // Forward authentication request to Strapi
    const res = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/auth/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok && data.jwt) {
      // Set JWT cookie
      cookies.set('jwt', data.jwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      });

      // Fetch full user data with role information
      const fullUser = await getCurrentUser(data.jwt, event);

      // Set user cookie
      const userValue = encodeURIComponent(JSON.stringify(fullUser));
      cookies.set('user', userValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      });

      // Return success with user data
      return new Response(JSON.stringify({
        ...data,
        user: fullUser
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Return error from Strapi
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    // Handle unexpected errors
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};