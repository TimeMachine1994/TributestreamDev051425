import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenName } from '$lib/server/auth/jwt';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.set(getTokenName(), '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 0
	});

	console.log('👋 User logged out, auth cookie cleared');
	return json({ success: true });
};