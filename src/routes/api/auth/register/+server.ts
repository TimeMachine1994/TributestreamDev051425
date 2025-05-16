import type { RequestHandler } from './$types';

 
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { username, email, password } = body;

		if (!username || !email || !password) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
		}


		const role = "family-contact";
		console.log('✅Role', role);

		// Step 2: Register the user with the role
		const registerRes = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/auth/local/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username,
				email,
				password,
				role,
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