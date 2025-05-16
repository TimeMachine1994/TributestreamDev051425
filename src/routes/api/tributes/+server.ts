// src/routes/api/tributes/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTributes, createTribute } from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';
import * as logger from '$lib/server/utils/logger';
// Base WordPress API URL
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';

/**
 * GET handler for tributes list
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ url }) => {
	logger.info?.('📥 [GET] /api/tributes');

	const query = url.searchParams.get('query') ?? '';
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

	try {
		const { tributes, pagination } = await searchTributes(query, page, pageSize);

		return json({
			tributes,
			current_page: pagination.page,
			total_pages: pagination.pageCount,
			total_items: pagination.total
		});
	} catch (err) {
		logger.error?.('❌ Failed to fetch tributes', err);
		return json({ message: 'Failed to fetch tributes' }, { status: 500 });
	}
};

/**
 * POST handler for creating a new tribute
 * Forwards the request to the WordPress API and returns the response
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	logger.info?.('📥 [POST] /api/tributes');

	try {
		const jwt = cookies.get('jwt');
		const user = await getUserFromJwt(jwt);

		if (!user) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const body = await request.json();
		const tribute = await createTribute({ ...body, user_id: user.id });

		return json({ tribute });
	} catch (err) {
		logger.error?.('❌ Failed to create tribute', err);
		return json({ message: 'Failed to create tribute' }, { status: 500 });
	}
};