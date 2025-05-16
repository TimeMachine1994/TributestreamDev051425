import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Helper function for logging with timestamp
function logWithTime(emoji: string, message: string, ...args: any[]) {
	const timestamp = new Date().toISOString();
	console.log(`${emoji} [${timestamp}] ${message}`, ...args);
}

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		logWithTime('🔄', 'SERVER: Login form action started');
		
		logWithTime('📝', 'SERVER: Processing form data');
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		
		logWithTime('🔍', 'SERVER: Validating form inputs', {
			emailProvided: !!email,
			emailType: typeof email,
			passwordProvided: !!password,
			passwordType: typeof password
		});

		if (typeof email !== 'string' || typeof password !== 'string') {
			logWithTime('⚠️', 'SERVER: Form validation failed - Invalid input types');
			return fail(400, { error: 'Invalid form submission' });
		}
		
		logWithTime('📧', `SERVER: Login attempt for email: ${email}, password length: ${password.length}`);
		
		logWithTime('🌐', 'SERVER: Sending request to internal API endpoint');
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identifier: email, password })
		});
		
		logWithTime('📡', `SERVER: API responded with status: ${res.status}`);

		if (!res.ok) {
			const data = await res.json();
			logWithTime('❌', 'SERVER: Login failed', data);
			return fail(res.status, { error: data.message || 'Login failed' });
		}
		
		logWithTime('✅', 'SERVER: Login successful');
		const data = await res.json();

		// Set JWT and user cookies
		cookies.set('jwt', data.jwt, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		cookies.set('user', encodeURIComponent(JSON.stringify(data.user)), {
			// accessible on client-side
			httpOnly: false,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});

		logWithTime('🚀', 'SERVER: Redirecting to protected area');
		throw redirect(303, '/my-portal');
	}
};