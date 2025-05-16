import type { RequestHandler } from './$types';

import { buildStrapiQuery } from '$lib/server/utils/strapi/strapiQueryBuilder';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { username, email, password } = body;

		if (!username || !email || !password) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
		}

		// Step 1: Get the role ID for "family-contact"
		const roleQuery = buildStrapiQuery(
			'https://miraculous-morning-0acdf6e165.strapiapp.com/api/users-permissions/roles',
			{ filters: { name: { eq: 'family-contact' } } }
		);

		const roleRes = await fetch(roleQuery);
		const roleData = await roleRes.json();

		const role = roleData?.data?.[0];
		if (!role) {
			console.error('❌ Role "family-contact" not found');
			return new Response(JSON.stringify({ error: 'Role not found' }), { status: 500 });
		}

		const roleId = role.id;
		console.log('✅ Found role ID for family-contact:', roleId);

		// Step 2: Register the user with the role
		const registerRes = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/auth/local/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username,
				email,
				password,
				role: roleId
			})
		});

		const registerData = await registerRes.json();

		if (!registerRes.ok) {
			console.error('❌ Registration failed:', registerData);
			return new Response(JSON.stringify(registerData), {
				status: registerRes.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.log('🎉 User registered successfully as family-contact');
		return new Response(JSON.stringify(registerData), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('🔥 Unexpected error during registration:', err);
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
	}
};