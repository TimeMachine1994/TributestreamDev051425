import type { RequestHandler } from './$types';

import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear authentication cookies
	cookies.delete('jwt', { path: '/' });
	cookies.delete('user', { path: '/' });
	cookies.delete('jwt_expires', { path: '/' });

	// Redirect to login page
	throw redirect(303, '/login');
};