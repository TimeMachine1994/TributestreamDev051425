import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/strapi/user';

export const GET: RequestHandler = async ({ cookies }) => {
	console.log('🔐 API: Auth check request received');
	const jwt = cookies.get('jwt');

	if (!jwt) {
		console.warn('🚫 API: No JWT cookie found');
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		console.log('🔍 API: Validating JWT and fetching user');
		const user = await getCurrentUser(jwt);
		console.log('✅ API: User authenticated:', user);

		return new Response(JSON.stringify({ user }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('💥 API: Error validating JWT:', err);
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};