import type { RequestHandler } from './$types';
import { getCurrentUser } from '$lib/server/strapi/user';

export const POST: RequestHandler = async ({ request, cookies }) => {
	console.log('🔐 API: Login request received');
	console.log('🕵️‍♂️ API: Inspecting request headers:', Object.fromEntries(request.headers.entries()));
	console.log('📏 API: Checking content length:', request.headers.get('content-length'));
	console.log('🕰️ API: Request received at:', new Date().toISOString());

	try {
		const body = await request.json();
		console.log(`📨 API: Login attempt for email: ${body.identifier || body.email}`);
		console.log('📦 API: Full request body:', body);

		console.log('🌐 API: Sending request to Strapi authentication endpoint');
		const res = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/auth/local', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		
		console.log(`🔄 API: Strapi responded with status: ${res.status}`);
		const data = await res.json();
		console.log('📬 API: Response body from Strapi:', data);

		if (res.ok && data.jwt) {
			console.log('✅ API: Authentication successful! JWT token received');
			console.log(`🔑 API: Setting JWT cookie (length: ${data.jwt.length})`);
			
			cookies.set('jwt_token', data.jwt, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/'
 			});
			console.log('🍪 API: JWT cookie set successfully (7d expiry)');
		} else {
			console.error('❌ API: Authentication failed', data);
			return new Response(JSON.stringify(data), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.log('📡 API: Fetching current user via Strapi client');
		const fullUser = await getCurrentUser(data.jwt);
		console.log('🧾 API: fullUser:', fullUser);
		// set user cookie with user data
		const userValue = encodeURIComponent(JSON.stringify(fullUser));
		cookies.set('user', userValue, {
		  httpOnly: true,
		  secure: true,
		  sameSite: 'lax',
		  path: '/'
		});
		console.log('🍪 API: user cookie set successfully');

		const responsePayload = JSON.stringify({
		  ...data,
		  user: fullUser
		});
		console.log('📦 API: Final response payload to client:', responsePayload);
		return new Response(responsePayload, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('💥 API: Error in login handler:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};