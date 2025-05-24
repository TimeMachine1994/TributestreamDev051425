// src/routes/api/tributes/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchTributes } from '$lib/server/strapi/tribute';
import type { Tribute, PaginationMeta } from '$lib/types/tribute';

export const GET: RequestHandler = async (event) => {
  const { url, locals } = event;

  // TODO: Implement authentication/authorization if needed.
  // For example, check locals.user or a JWT from cookies if this endpoint should be protected.
  // if (!locals.user) {
  //   throw error(401, 'Unauthorized');
  // }

  try {
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const query = url.searchParams.get('query') || undefined;
    const sort = url.searchParams.get('sort') || undefined; // Or handle multiple sort params if needed

    // Handle 'populate' parameter
    // The 'populate=*' from your +page.server.ts suggests wanting all direct relations.
    // The searchTributes function defaults to ['owner'], so we might want to override.
    // Strapi's 'populate=*' can be performance-intensive. Be specific if possible.
    let populate: string[] | undefined;
    const populateParam = url.searchParams.get('populate');
    console.log(`Received populateParam: ${populateParam}`); // Log the received param

    if (populateParam) {
      if (populateParam === '*') {
        console.log("Overriding populate='*' with ['owner'] for testing.");
       } else {
        populate = populateParam.split(',');
      }
    }
    // If populateParam is null/undefined, 'populate' will remain undefined,
    // and searchTributes will use its default ['owner'].

    // TODO: Handle complex 'filters' if you need to pass them via URL.
    // This would require parsing a JSON string or a specific query param format.
    // const filtersParam = url.searchParams.get('filters');
    // const filters = filtersParam ? JSON.parse(filtersParam) : undefined;

    const result = await searchTributes({
      page,
      pageSize,
      query,
      sort,
      populate, // Pass the parsed populate array
      // filters, // Pass parsed filters if implementing
      event, // Pass the event object as required by searchTributes
    });

    // The searchTributes function returns { tributes: Tribute[]; meta: PaginationMeta }
    // The +page.server.ts expects { tributes: [...] }
    // So, we should return the whole result object from searchTributes,
    // and the +page.server.ts can destructure it or use result.tributes.
    // Or, if +page.server.ts strictly expects only the tributes array under a 'tributes' key:
    // return json({ tributes: result.tributes, meta: result.meta });
    // Given the +page.server.ts line 39: `const rawDocs = (tributesApiResponse.tributes || [])`
    // it seems to expect an object with a 'tributes' property.
    return json({ tributes: result.tributes, meta: result.meta });

  } catch (err: any) {
    console.error('Error in /api/tributes GET handler:', err);
    const statusCode = typeof err.status === 'number' ? err.status : 500;
    const message = err.body?.message || err.message || 'Failed to fetch tributes';
    throw error(statusCode, message);
  }
};