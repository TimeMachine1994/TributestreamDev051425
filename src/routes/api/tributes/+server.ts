// src/routes/api/tributes/+server.ts
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { searchTributes, createTribute } from '$lib/server/strapi/tribute';
import type { Tribute } from '$lib/types/tribute';
import type { RequestEvent } from '@sveltejs/kit';
import type { PaginationMeta } from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';
import * as logger from '$lib/server/utils/logger';

/**
 * GET handler for tributes list
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	logger.info?.('📥 [GET] /api/tributes');

	const query = url.searchParams.get('query') ?? '';
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
	const jwt = cookies.get('jwt');
	try {
		const event = { cookies } as RequestEvent;
		const { items, meta }: { items: Tribute[]; meta: PaginationMeta } =
			await searchTributes({ query, page, pageSize }, event);

		return json({
			tributes: items,
			current_page: meta.page,
			total_pages: meta.pageCount,
			total_items: meta.total
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

	const CreateTributeSchema = z.object({
		name: z.string().min(1),
		description: z.string().min(1),
		status: z.enum(['draft', 'published', 'archived']).optional()
	});

	try {
		const jwt = cookies.get('jwt');
		if (!jwt) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}
		const user = await getUserFromJwt(jwt);

		if (!user) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const body = await request.json();
		const payload = CreateTributeSchema.parse(body);

		const tribute: Tribute = await createTribute({ ...payload, user_id: user.id }, jwt);

		return json({ tribute });
	} catch (err) {
		if (err instanceof z.ZodError) {
			logger.warn?.('⚠️ Validation failed', err.flatten());
			return json({ message: 'Invalid input', errors: err.flatten() }, { status: 400 });
		}
		logger.error?.('❌ Failed to create tribute', err);
		return json({ message: 'Failed to create tribute' }, { status: 500 });
	}
};