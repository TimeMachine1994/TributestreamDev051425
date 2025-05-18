import { searchTributes } from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies, request }) => {
	console.log('🟡 [load] Entering /my-portal/tributes route');

	const token = cookies.get('jwt');
	console.log('🔑 JWT token from cookies:', token);
	if (!token) {
		console.warn('⛔ No JWT token found. Throwing 403.');
		throw error(403, 'Forbidden');
	}

	const user = await getUserFromJwt(token, { request, url, cookies } as any);
	console.log('👤 Decoded user:', user);

	const role = user?.role?.name?.toLowerCase();
	console.log('🛡️ User role:', role);
	if (!user || role !== 'admin') {
		console.warn('⛔ User is not admin or user not found. Throwing 403.');
		throw error(403, 'Forbidden');
	}

	const q = url.searchParams.get('q') ?? undefined;
	console.log('🔍 Search query param:', q);

	const { items: tributes } = await searchTributes({ query: q }, { request, url, cookies } as any);
	console.log(`📦 Retrieved ${tributes.length} tributes`);

	console.log('✅ [load] Completed /my-portal/tributes route');
	return { tributes, q };
};