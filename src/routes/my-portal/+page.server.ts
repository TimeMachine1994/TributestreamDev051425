import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/server/utils/auth';
import { getUserById } from '$lib/server/strapi/user';

export const load: PageServerLoad = async (event) => {
	const { fetch, cookies } = event;
	console.log('[my-portal/+page.server] Fetching tribute data from /api/tributes');

	const res = await fetch('/api/tributes');

	if (!res.ok) {
		console.error('[my-portal/+page.server] Failed to fetch tribute data:', res.status);
		throw error(res.status, 'Failed to fetch tribute data');
	}

	const tributeData = await res.json();
	console.log('[my-portal/+page.server] tributeData:', tributeData);

	const jwt = cookies.get('jwt');
	const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;
	const user = userJwt ? await getUserById(userJwt.id.toString(), event) : null;

	return {
		tributeData,
		user
	};
};