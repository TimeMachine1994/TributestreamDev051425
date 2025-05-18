import { error } from '@sveltejs/kit';
import { getTributeById } from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies, request, url }) => {
	const token = cookies.get('jwt');
	if (!token) throw error(403, 'Forbidden');
	const user = await getUserFromJwt(token, { request, url, cookies } as any);
	if (!user || user.role?.name?.toLowerCase() !== 'admin') throw error(403, 'Forbidden');

	console.log('🔍 Loading tribute for edit page with ID:', params.id);

	const tribute = await getTributeById(params.id, { request, url, cookies } as any);

	if (!tribute) {
		console.error('❌ Tribute not found for ID:', params.id);
		throw error(404, 'Tribute not found');
	}

	console.log('✅ Tribute loaded:', tribute);

	return {
		tribute
	};
};