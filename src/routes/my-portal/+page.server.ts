import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/server/auth/';
import { getUserById } from '$lib/server/strapi/user';
import client from '$lib/server/strapi/strapiClient';

 export const load: PageServerLoad = async (event) => {
	const { fetch, cookies } = event;
	
	console.log('[my-portal/+page.server] Fetching tribute data from /api/tributes');
	const tributes = client.collection('tributes');

  
	console.log('[my-portal/+page.server] tributeData:', tributes);

	const jwt = cookies.get('jwt');
	const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;
	const user = userJwt ? await getUserById(userJwt.id.toString(), event) : null;

	if (!user) {
		console.warn('[my-portal/+page.server] No user found, redirecting to /login');
		throw redirect(302, '/login');
	}

	return {
		tributes,
		user
	};
};