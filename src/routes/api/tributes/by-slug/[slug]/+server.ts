// src/routes/api/tributes/by-slug/[slug]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTributeBySlug } from '$lib/server/strapi/tribute';
import { logger } from '$lib/utils/logger';
// Base WordPress API URL

/**
 * GET handler for fetching a tribute by slug
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ params }) => {
	logger.info(`📥 [GET] /api/tributes/by-slug/${params.slug}`);

	try {
		const tribute = await getTributeBySlug(params.slug);

		if (!tribute) {
			logger.warn(`⚠️ Tribute not found for slug: ${params.slug}`);
			return json({ error: 'Tribute not found' }, { status: 404 });
		}

		return json({ tribute });
	} catch (err) {
		logger.error(`❌ Error fetching tribute by slug: ${params.slug}`, err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};