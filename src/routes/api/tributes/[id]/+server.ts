// src/routes/api/tributes/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTributeById, updateTribute, deleteTribute } from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';
const requireUser = async (cookies: import('@sveltejs/kit').Cookies) => {
const jwt = cookies.get('jwt');
if (!jwt) throw json({ message: 'Authentication required' }, { status: 401 });
const user = await getUserFromJwt(jwt);
if (!user) throw json({ message: 'Invalid token' }, { status: 401 });
return user;
};
/**
 * GET handler for a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		console.log(`📥 GET tribute ${params.id}`);
		const tribute = await getTributeById(params.id);
		if (!tribute) return json({ message: 'Tribute not found' }, { status: 404 });
		return json({ tribute });
	} catch (err) {
		console.error('❌ Error fetching tribute', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};

/**
 * PUT handler for updating a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	try {
		console.log(`✏️ PUT tribute ${params.id}`);
		const user = await requireUser(cookies);
		const tribute = await getTributeById(params.id);
		if (!tribute) return json({ message: 'Tribute not found' }, { status: 404 });

		if (tribute.user?.id !== user.id && user.role?.type !== 'admin') {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		const data = await request.json();
		delete data.user_id;

		const updated = await updateTribute(params.id, data);
		return json({ tribute: updated });
	} catch (err) {
		console.error('❌ Error updating tribute', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};

/**
 * DELETE handler for removing a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		console.log(`🗑️ DELETE tribute ${params.id}`);
		const user = await requireUser(cookies);
		const tribute = await getTributeById(params.id);
		if (!tribute) return json({ message: 'Tribute not found' }, { status: 404 });

		if (tribute.user?.id !== user.id && user.role?.type !== 'admin') {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		await deleteTribute(params.id);
		return json({ success: true });
	} catch (err) {
		console.error('❌ Error deleting tribute', err);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};