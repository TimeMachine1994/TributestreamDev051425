import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signJwt, getTokenName } from '$lib/server/auth/jwt';

const STRAPI_API_URL = process.env.STRAPI_API_URL;

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { identifier, password } = await request.json();

		const res = await fetch(`${STRAPI_API_URL}/api/auth/local`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identifier, password })
		});

		if (!res.ok) {
			const error = await res.json();
			console.error('❌ Login failed:', error);
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const { user, jwt } = await res.json();

		const token = signJwt({
			id: user.id,
			email: user.email,
			role: user.role?.name || 'user'
		});

		cookies.set(getTokenName(), token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		console.log('✅ Login successful for user:', user.email);
		return json({ user: { id: user.id, email: user.email, role: user.role?.name } });
	} catch (err) {
		console.error('❌ Unexpected error during login:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};