import type { RequestEvent } from '@sveltejs/kit';
import { strapiFetch } from './rest-api';
import type {
	Tribute,
	TributeInputAttributes,
	StrapiSingleTributeResponse,
	StrapiTributeCollectionResponse,
	PaginationMeta,
	mapStrapiTributeToAppTribute
} from '$lib/types/tribute';

export type { PaginationMeta }; // Re-export for convenience

export async function createTribute(
	data: TributeInputAttributes,
	event: RequestEvent
): Promise<Tribute> {
	console.log('🟢 Creating tribute with REST API...', data);
	try {
		const response = await strapiFetch<StrapiSingleTributeResponse>(
			'/tributes', // Endpoint for creating tributes
			{
				method: 'POST',
				body: JSON.stringify({ data }), // Strapi v4/v5 expects payload wrapped in 'data'
			},
			event
		);
		console.log('✅ Tribute created successfully via REST!', response);
		const mappedTribute = mapStrapiTributeToAppTribute(response.data);
		if (!mappedTribute) {
			throw new Error('Failed to map created tribute from Strapi response');
		}
		return mappedTribute;
	} catch (error) {
		console.error('❌ Error creating tribute via REST:', error);
		throw error; // Re-throw to be handled by the caller (e.g., form action)
	}
}

export async function getTributeById(
	id: string | number,
	event: RequestEvent,
	populateRelations: string[] = ['owner'] // Default to populating owner
): Promise<Tribute | null> {
	console.log('🔵 DEBUG: Fetching tribute by ID via REST:', id);
	if (!id) {
		console.error('🔵 DEBUG: Invalid tribute ID for REST call:', id);
		return null;
	}

	const populateQuery = populateRelations.length > 0 ? `?populate=${populateRelations.join(',')}` : '';
	const endpoint = `/tributes/${id}${populateQuery}`;

	try {
		const response = await strapiFetch<StrapiSingleTributeResponse>(endpoint, { method: 'GET' }, event);
		return mapStrapiTributeToAppTribute(response.data);
	} catch (error: any) {
		if (error.status === 404) {
			console.log(`🔵 Tribute with ID ${id} not found via REST.`);
			return null;
		}
		console.error(`🔴 Error fetching tribute ${id} via REST:`, error);
		throw error;
	}
}

export async function getTributeBySlug(
	slug: string,
	event: RequestEvent,
	populateRelations: string[] = ['owner']
): Promise<Tribute | null> {
	console.log('🟣 DEBUG: Fetching tribute by slug via REST:', slug);
	if (!slug) {
		console.error('🟣 DEBUG: Invalid tribute slug for REST call:', slug);
		return null;
	}

	const params = new URLSearchParams();
	params.append('filters[slug][$eq]', slug);
	populateRelations.forEach((relation, index) => {
		// Strapi's complex populate syntax: populate[0]=relation1, populate[1]=relation2
		// Or for deeper population: populate[relationName][populate]=nestedField
		// For simple top-level population:
		params.append(`populate[${index}]`, relation);
	});
	
	const endpoint = `/tributes?${params.toString()}`;

	try {
		const response = await strapiFetch<StrapiTributeCollectionResponse>(endpoint, { method: 'GET' }, event);
		if (response.data && response.data.length > 0) {
			return mapStrapiTributeToAppTribute(response.data[0]);
		}
		return null;
	} catch (error) {
		console.error(`🔴 Error fetching tribute by slug "${slug}" via REST:`, error);
		throw error;
	}
}

export async function updateTribute(
	id: string | number,
	data: TributeInputAttributes,
	event: RequestEvent
): Promise<Tribute> {
	console.log('🟠 DEBUG: Updating tribute ID via REST:', id, data);
	try {
		const response = await strapiFetch<StrapiSingleTributeResponse>(
			`/tributes/${String(id)}`,
			{
				method: 'PUT',
				body: JSON.stringify({ data }), // Strapi v4/v5 expects payload wrapped in 'data'
			},
			event
		);
		const mappedTribute = mapStrapiTributeToAppTribute(response.data);
		if (!mappedTribute) {
			throw new Error('Failed to map updated tribute from Strapi response');
		}
		return mappedTribute;
	} catch (error) {
		console.error(`🔴 Error updating tribute ${id} via REST:`, error);
		throw error;
	}
}

export async function deleteTribute(
	id: string | number,
	event: RequestEvent
): Promise<Tribute | null> { // Strapi often returns the deleted item
	console.log('🔴 Deleting tribute ID via REST:', id);
	try {
		// Strapi's DELETE operation typically returns the deleted entity, wrapped in 'data'
		const response = await strapiFetch<StrapiSingleTributeResponse>(
			`/tributes/${String(id)}`,
			{ method: 'DELETE' },
			event
		);
		console.log(`🗑️ Tribute ${id} deleted successfully via REST!`, response);
		return mapStrapiTributeToAppTribute(response.data);
	} catch (error) {
		console.error(`🔴 Error deleting tribute ${id} via REST:`, error);
		throw error;
	}
}

interface SearchTributesParams {
	page?: number;
	pageSize?: number;
	query?: string; // For simple text search
	filters?: Record<string, any>; // For more complex Strapi filters
	sort?: string | string[]; // e.g., 'name:asc' or ['name:asc', 'date:desc']
	populate?: string[];
	event: RequestEvent;
}

export async function searchTributes({
	page = 1,
	pageSize = 10,
	query = '',
	filters,
	sort,
	populate = ['owner'], // Default populate
	event
}: SearchTributesParams): Promise<{ tributes: Tribute[]; meta: PaginationMeta }> {
	console.log('🟡 Searching tributes via REST...', { page, pageSize, query, filters, sort, populate });
	
	const params = new URLSearchParams();
	params.append('pagination[page]', String(page));
	params.append('pagination[pageSize]', String(pageSize));

	if (query) {
		// Simple query: assumes searching in a predefined field like 'name' or 'description'
		// For more complex search, use the 'filters' object.
		// Example: search 'name' field case-insensitively
		params.append('filters[name][$containsi]', query);
	}

	if (filters) {
		// Advanced filtering: caller provides Strapi filter object
		// This needs careful construction on the client/caller side.
		// Example: filters: { '$or': [ { name: { '$containsi': query } }, { description: { '$containsi': query } } ] }
		// This part might need a more robust way to serialize complex filter objects to query params.
		// For now, let's assume simple filters are handled or caller serializes them.
		Object.entries(filters).forEach(([key, value]) => {
			// This is a naive serialization, Strapi's filter syntax can be complex.
			// e.g. filters[field][operator]=value
			// A proper deep object to query param converter might be needed for complex cases.
			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				params.append(key, String(value));
			} else {
				console.warn(`Skipping complex filter ${key} in searchTributes basic serialization.`);
			}
		});
	}
	
	if (sort) {
		if (Array.isArray(sort)) {
			sort.forEach((sortField, index) => params.append(`sort[${index}]`, sortField));
		} else {
			params.append('sort', sort);
		}
	}

	if (populate && populate.length > 0) {
		populate.forEach((p, index) => params.append(`populate[${index}]`, p));
	}

	const queryString = params.toString();
	const endpoint = `/tributes?${queryString}`;

	try {
		const response = await strapiFetch<StrapiTributeCollectionResponse>(endpoint, { method: 'GET' }, event);
		
		const mappedTributes = response.data
			.map(entity => mapStrapiTributeToAppTribute(entity))
			.filter(t => t !== null) as Tribute[]; // Filter out nulls and assert type

		return {
			tributes: mappedTributes,
			meta: response.meta.pagination,
		};
	} catch (error) {
		console.error('❌ Error searching tributes via REST:', error);
		throw error;
	}
}
