import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyJwt } from '$lib/server/auth/jwt';
import { updateUserPassword, getUserById } from '$lib/server/wp-user-service';
import { hashPassword } from '$lib/utils/auth-helpers';

export const POST: RequestHandler = async ({ request }) => {
	const { token, password } = await request.json();

	if (!token || !password) {
		return json({ error: 'Token and password are required' }, { status: 400 });
	}

	const payload = verifyJwt(token);
	if (!payload) {
		return json({ error: 'Invalid or expired token' }, { status: 400 });
	}

	const user = await getUserById(payload.id);
	if (!user || user.email !== payload.email) {
		return json({ error: 'Invalid token context' }, { status: 400 });
	}

	const hashed = await hashPassword(password);
	await updateUserPassword(user.id, hashed);

	return json({ success: true });
};