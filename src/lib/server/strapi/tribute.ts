import type { Tribute, TributeAttributes } from '$lib/types/tribute';
import { getStrapiClient } from './client';
import type { RequestEvent } from '@sveltejs/kit';

type PaginationMeta = {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
};

export type { PaginationMeta };

export async function createTribute(data: Partial<Tribute>, event: RequestEvent): Promise<Tribute> {
	console.log('🟢 Creating tribute...', data);
	
	try {
		const strapi = getStrapiClient(event);
		console.log('📊 Using Strapi client to create tribute');
		
		const res = await strapi.collection('tributes').create({ data });
		console.log('✅ Tribute created successfully!', res);
		return res.data as unknown as Tribute;
	} catch (error) {
		console.error('❌ Failed to create tribute:', error);
		throw error;
	}
}

export async function getTributeById(id: string | number, event: RequestEvent) {
	console.log('🔵 DEBUG: Fetching tribute by ID:', id, `(type: ${typeof id})`);
	
	// Check if we have a valid ID
	if (!id) {
		console.error('🔵 DEBUG: Invalid tribute ID:', id);
		return null;
	}
	
	try {
		console.log('🔵 DEBUG: Getting Strapi client');
const strapi = getStrapiClient(event);
		
		// Convert ID to string for Strapi client
		const idStr = String(id);
		console.log(`🔵 DEBUG: Converted ID to string: "${idStr}"`);
		console.log(`🔵 DEBUG: Making request to Strapi for tribute ID: ${idStr}`);
		
		// Log the full URL that will be requested
		console.log(`🔵 DEBUG: Full Strapi request URL: ${event.url.origin}/api/tributes/${idStr}?populate=*`);
		
		console.log(`🔵 DEBUG: Fetching tribute with findOne API`);
		try {
			console.log('🔵 DEBUG: Inside nested try block');
			const res = await strapi.collection('tributes').findOne(idStr, {
				populate: '*'
			});
		
			console.log(`🔵 DEBUG: Response structure:`, JSON.stringify(res, null, 2));
			
			if (res && res.data) {
				console.log(`🔵 DEBUG: Successfully found tribute with ID: ${idStr}`);
				return res.data as unknown as Tribute;
			}
			
			// If we couldn't find it, log the warning and return null
			console.warn(`🔵 DEBUG: No tribute found with ID: ${idStr}`);
			return null;
		} catch (err) {
			console.error('🔵 DEBUG: Error in nested try-catch:', err);
			
			// Additional logging for common error patterns
			if (err && typeof err === 'object' && 'status' in err) {
				console.error(`🔵 DEBUG: Status code: ${(err as any).status}`);
			}
			if (err && typeof err === 'object' && 'message' in err) {
				console.error(`🔵 DEBUG: Error message: ${(err as any).message}`);
			}
			if (err && typeof err === 'object' && 'request' in err) {
				console.error(`🔵 DEBUG: Request information:`, {
					url: (err as any).request?.url || 'No URL',
					method: (err as any).request?.method || 'No method',
					headers: (err as any).request?.headers || 'No headers'
				});
			}
			
			return null;
		}
	} catch (outerErr) {
		console.error('🔵 DEBUG: Error in outer try-catch:', outerErr);
		return null;
	}
}


export async function getTributeBySlug(slug: string, event: RequestEvent) {
	console.log('🟣 DEBUG: Fetching tribute by slug:', slug);

	try {
		console.log('🟣 DEBUG: Getting Strapi client');
		const strapi = getStrapiClient(event);
		console.log(`🟣 DEBUG: Using Strapi client to find tribute with slug: ${slug}`);

		console.log('🟣 DEBUG: About to call Strapi find API with slug filter');
		const res = await strapi.collection('tributes').find({
			filters: { slug: { $eq: slug } },
			populate: '*'
		});

		console.log(`🟣 DEBUG: Response received, data count: ${res.data?.length || 0}`);
		return res.data?.[0] ?? null;
	} catch (err) {
		console.error('🟣 DEBUG: Error fetching tribute by slug:', err);
		console.error('🟣 DEBUG: Error type:', typeof err);
		
		if (err && typeof err === 'object') {
			console.error('🟣 DEBUG: Error object keys:', Object.keys(err));
		}
		
		return null;
	}
}

export async function updateTribute(id: string | number, data: Partial<TributeAttributes>, event: RequestEvent): Promise<Tribute> {
	console.log('🟠 DEBUG: Updating tribute ID:', id, `(type: ${typeof id})`);
	console.log('🟠 DEBUG: Update data (attributes):', JSON.stringify(data, null, 2));
	
	console.log('🟠 DEBUG: Getting Strapi client');
	const strapi = getStrapiClient(event);
	
	// Convert ID to string for Strapi client
	const idStr = String(id);
	console.log(`🟠 DEBUG: Converted ID to string: "${idStr}"`);
	
	try {
		console.log('🟠 DEBUG: About to call Strapi update API');
		// The 'data' object (Partial<TributeAttributes>) should be passed directly as the second argument.
		// The Strapi client will handle wrapping it in a 'data' key if necessary for the API.
		console.log('🟠 DEBUG: Payload being sent to Strapi client update method:', JSON.stringify(data, null, 2));
		
		const res = await strapi.collection('tributes').update(idStr, data); // Pass 'data' directly
		
		console.log('🟠 DEBUG: Strapi update API call successful');
		console.log('🟠 DEBUG: Raw response:', JSON.stringify(res, null, 2));
		
		if (!res || !res.data) {
			console.error('🟠 DEBUG: Response missing data property');
			throw new Error('Invalid response from Strapi: missing data property');
		}
		
		console.log(`🟠 DEBUG: Successfully updated tribute with ID: ${idStr}`);
		return res.data as unknown as Tribute;
	} catch (err) {
		console.error('🟠 DEBUG: Error in updateTribute:', err);
		console.error('🟠 DEBUG: Error type:', typeof err);
		
		// Log detailed error information
		if (err && typeof err === 'object') {
			console.error('🟠 DEBUG: Error object keys:', Object.keys(err));
			
			if ('response' in err && (err as any).response instanceof Response) {
				const strapiErrorResponse = (err as any).response as Response;
				try {
					const errorBody = await strapiErrorResponse.json();
					console.error('🟠 DEBUG: Strapi error response body:', JSON.stringify(errorBody, null, 2));
				} catch (e) {
					console.error('🟠 DEBUG: Could not parse Strapi error response body as JSON. Status:', strapiErrorResponse.status, 'StatusText:', strapiErrorResponse.statusText);
					// Fallback to text if JSON parsing fails
					try {
						const errorText = await strapiErrorResponse.text();
						console.error('🟠 DEBUG: Strapi error response text:', errorText);
					} catch (e2) {
						console.error('🟠 DEBUG: Could not read Strapi error response as text.');
					}
				}
			} else if ('response' in err) {
				// If it's not a Response object, log it as is
				console.error('🟠 DEBUG: Strapi error (unknown response type):', JSON.stringify((err as any).response, null, 2));
			}
			
			if ('message' in err) {
				console.error('🟠 DEBUG: Error message:', (err as any).message);
			}
			
			if ('stack' in err) {
				console.error('🟠 DEBUG: Error stack:', (err as any).stack);
			}
		}
		
		throw err;
	}
}

export async function deleteTribute(id: string | number, event: RequestEvent) {
	console.log('🔴 Deleting tribute ID:', id);
	const strapi = getStrapiClient(event);
	
	// Convert ID to string for Strapi client
	const idStr = String(id);
	console.log(`🗑️ Deleting tribute with ID: ${idStr}`);
	
	try {
		await strapi.collection('tributes').delete(idStr);
		console.log(`✅ Successfully deleted tribute with ID: ${idStr}`);
		return { success: true };
	} catch (error) {
		console.error(`❌ Error deleting tribute with ID ${idStr}:`, error);
		throw error;
	}
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

	try {
		console.log(`🔍 Using Strapi client to search tributes with filters:`, filters);
		const res = await strapi.collection('tributes').find({
			pagination: { page, pageSize },
			filters
		});
		
		console.log(`📊 Search results: found ${res.data?.length || 0} tributes`);
		
		// Cast data to Tribute[] type
		const tributes = res.data as unknown as Tribute[];
		console.log(`✅ Successfully retrieved ${tributes.length} tributes`);
		
		return {
			items: tributes,
			meta: res.meta.pagination as PaginationMeta
		};
	} catch (error) {
		console.error('❌ Error searching tributes:', error);
		throw error;
	}
}
