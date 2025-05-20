import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect to portal if already logged in
  if (locals.user) throw redirect(303, '/my-portal');
  return {};
};

export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    // Process form data
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    // Validate form inputs
    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { error: 'Invalid form submission' });
    }

    // Forward authentication request to internal API
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password })
    });

    // Handle API response
    if (!res.ok) {
      const data = await res.json();
      return fail(res.status, { error: data.error || 'Login failed' });
    }

    // Extract successful login data
    const data = await res.json();

    // Set cookies for client
    cookies.set('jwt', data.jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });

    // Store user data in cookie to reduce JWT verification overhead
    const userValue = encodeURIComponent(JSON.stringify(data.user));
    cookies.set('user', userValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });

    // Redirect to portal
    throw redirect(303, '/my-portal');
  }
};