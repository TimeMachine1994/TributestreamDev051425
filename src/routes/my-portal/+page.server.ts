import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/utils/auth';
import { getUserById } from '$lib/server/strapi/user';
import { getStrapiClient } from '$lib/server/strapi/client';

export const load: PageServerLoad = async (event) => {
	const { fetch, cookies } = event;
	
	console.log('[my-portal/+page.server] Fetching tribute data from /api/tributes');
	const strapiClient = getStrapiClient(event);
	const tributes = await strapiClient.collection('tributes').find();
console.debug('[my-portal/+page.server] Raw tribute response:', tributes);
	
	console.log('[my-portal/+page.server] tributeData:', tributes);

	const jwt = cookies.get('jwt');
	const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;
	const user = userJwt ? await getUserById(userJwt.id.toString(), event) : null;

	if (!user) {
		console.warn('[my-portal/+page.server] No user found, redirecting to /login');
		throw redirect(302, '/login');
	}

	return {
		tributes: tributes.data,
		user
	};
};