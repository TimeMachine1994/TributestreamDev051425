import { strapi } from './client';
import type { Tribute } from '$lib/server/types';

const endpoint = 'api/tributes';

export async function createTribute(data: Partial<Tribute>) {
	console.log('🟢 Creating tribute...', data);
	const res = await strapi.post(endpoint, { data });
	return res.data;
}

export async function getTributeById(id: string | number) {
	console.log('🔵 Fetching tribute by ID:', id);
	const res = await strapi.get(`${endpoint}/${id}`, {
		params: { populate: 'deep' }
	});
	return res.data;
}

export async function getTributeBySlug(slug: string) {
	console.log('🟣 Fetching tribute by slug:', slug);
	const res = await strapi.get(endpoint, {
		params: {
			filters: { slug: { $eq: slug } },
			populate: 'deep'
		}
	});
	return res.data?.[0] ?? null;
}

export async function updateTribute(id: string | number, data: Partial<Tribute>) {
	console.log('🟠 Updating tribute ID:', id, data);
	const res = await strapi.put(`${endpoint}/${id}`, { data });
	return res.data;
}

export async function deleteTribute(id: string | number) {
	console.log('🔴 Deleting tribute ID:', id);
	const res = await strapi.del(`${endpoint}/${id}`);
	return res.data;
}

export async function searchTributes({
	page = 1,
	pageSize = 10,
	query = ''
}: {
	page?: number;
	pageSize?: number;
	query?: string;
}) {
	console.log('🟡 Searching tributes...', { page, pageSize, query });
	const filters = query
		? {
				$or: [
					{ name: { $containsi: query } },
					{ slug: { $containsi: query } },
					{ obituary: { $containsi: query } }
				]
		  }
		: undefined;

	const res = await strapi.get(endpoint, {
		params: {
			populate: 'deep',
			pagination: { page, pageSize },
			filters
		}
	});

	return {
		items: res.data,
		meta: res.meta
	};
}