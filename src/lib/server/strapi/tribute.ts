import { strapi as createStrapiClient } from '@strapi/client';
import type { Tribute } from '$lib/types/tribute';

type PaginationMeta = {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
};

export type { PaginationMeta };

import { getStrapiClient } from './client';
import type { RequestEvent } from '@sveltejs/kit';

export async function createTribute(data: Partial<Tribute>, jwt: string): Promise<Tribute> {
	console.log('🟢 Creating tribute...', data);
	const res = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/tributes', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${jwt}`
		},
		body: JSON.stringify({ data })
	});
	if (!res.ok) {
		throw new Error(`Failed to create tribute: ${res.statusText}`);
	}
	const json = await res.json();
	return json.data;
}

export async function getTributeById(id: string | number, event: RequestEvent) {
	console.log('🔵 Fetching tribute by ID:', id);
	try {
		const strapi = getStrapiClient(event);
		const res = await strapi.collection('tributes').findOne(String(id), {
			populate: '*'
		});
		return res.data;
	} catch (err) {
		console.error('❌ Error fetching tribute by ID:', err);
		return null;
	}
}

export async function getTributeBySlug(slug: string, event: RequestEvent) {
	console.log('🟣 Fetching tribute by slug:', slug);
	const strapi = getStrapiClient(event);
	const res = await strapi.collection('tributes').find({
		filters: { slug: { $eq: slug } },
		populate: '*'
	});
	return res.data?.[0] ?? null;
}

export async function updateTribute(id: string | number, data: Partial<Tribute>, event: RequestEvent) {
	console.log('🟠 Updating tribute ID:', id, data);
	const strapi = getStrapiClient(event);
	const res = await strapi.collection('tributes').update(String(id), { data });
	return res.data;
}

export async function deleteTribute(id: string | number, event: RequestEvent) {
	console.log('🔴 Deleting tribute ID:', id);
	const strapi = getStrapiClient(event);
	await strapi.collection('tributes').delete(String(id));
	return { success: true };
}

export async function searchTributes({
	page = 1,
	pageSize = 10,
	query = ''
}: {
	page?: number;
	pageSize?: number;
	query?: string;
}, event: RequestEvent): Promise<{ items: Tribute[]; meta: PaginationMeta }> {
	console.log('🟡 Searching tributes...', { page, pageSize, query });
	const strapi = getStrapiClient(event);

	const filters = query
		? {
				$or: [
					{ name: { $containsi: query } },
					{ slug: { $containsi: query } },
					{ obituary: { $containsi: query } }
				]
		  }
		: undefined;

	const res = await strapi.collection('tributes').find({
		pagination: { page, pageSize },
		filters
	});

	return {
		items: res.data as unknown as Tribute[],
		meta: res.meta.pagination as PaginationMeta
	};
}