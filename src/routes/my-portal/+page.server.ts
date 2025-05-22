import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/utils/auth';
import { getStrapiClient } from '$lib/server/strapi/client';
import { updateTribute as strapiUpdateTribute } from '$lib/server/strapi/tribute';
import type { Tribute, Status, TributeAttributes } from '$lib/types/tribute'; // Import TributeAttributes
// Strapi's client typically returns data where each item has an id and attributes.
// We can use a more generic type or a specific one if available from generated types.
import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';

export const load: PageServerLoad = async (event) => {
  const { cookies } = event;

  // Get JWT and check user authentication
  const jwt = cookies.get('jwt');
  const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;

  if (!userJwt) {
    // Redirect to login if not authenticated
    throw redirect(302, '/login');
  }

  // Fetch tributes for the user
  const strapiClient = getStrapiClient(event);
  // Add populate: '*' to ensure all attributes are fetched
  const tributesResponse = await strapiClient.collection('tributes').find({
    populate: '*' 
  });

  // Properly map Strapi response data to Tribute[]
  // The `find()` method with `populate: '*'` might be returning flat objects.
  // We need to transform them into the { id, attributes: { ... } } structure.
  const rawDocs = tributesResponse.data as unknown as Array<any>; // Treat as array of any for now
  
  const tributesData: Tribute[] = rawDocs.map(doc => {
    if (doc && typeof doc.id === 'number') {
      // If 'attributes' field already exists and is an object, use it directly.
      // This handles cases where Strapi might return nested or flat structures differently.
      if (doc.attributes && typeof doc.attributes === 'object') {
        return {
          id: doc.id,
          attributes: doc.attributes as TributeAttributes
        };
      }
      // If attributes are top-level, construct the attributes object.
      // Exclude 'id' and other known top-level Strapi fields from being put into 'attributes'.
      const { id, createdBy, updatedBy, publishedAt, ...attributeFields } = doc;
      return {
        id: doc.id,
        attributes: attributeFields as TributeAttributes
      };
    }
    console.warn('Problematic document from Strapi (cannot map to Tribute):', JSON.stringify(doc));
    return null; // Mark for filtering
  }).filter(tribute => tribute !== null) as Tribute[]; // Filter out nulls and assert type

  return {
    tributes: tributesData,
    user: userJwt
  };
};

export const actions: Actions = {
	updateTribute: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id');
		const name = formData.get('name');
		const description = formData.get('description');
		const status = formData.get('status');

		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'Tribute ID is missing or invalid.' });
		}
		if (!name || typeof name !== 'string') {
			return fail(400, { message: 'Name is required.' });
		}
		// Basic validation for status
		if (status && !['draft', 'published', 'archived'].includes(status as string)) {
			return fail(400, { message: 'Invalid status value.' });
		}

		// Construct the data payload for Strapi update (flat attributes)
		const tributeDataToUpdate: Partial<TributeAttributes> = {
			name: name as string,
		};

		if (description && typeof description === 'string' && description.trim() !== '') {
			tributeDataToUpdate.description = description as string;
		} else if (description === '') { // Handle case where description is explicitly cleared
			tributeDataToUpdate.description = null; // Or undefined, depending on how Strapi handles empty optional fields
		}

		if (status && typeof status === 'string' && status.trim() !== '') {
			tributeDataToUpdate.status = status as Status;
		}

		try {
			// strapiUpdateTribute expects the flat attributes for the 'data' part of the payload
			const updatedTributeFromStrapi = await strapiUpdateTribute(id, tributeDataToUpdate, event);
			
			// The AdminPortal.svelte component expects the full Tribute structure (id + attributes)
			// The updatedTributeFromStrapi from tribute.ts should already be in this format.
			return { success: true, updatedTribute: updatedTributeFromStrapi };
		} catch (err) {
			console.error('Error updating tribute in page.server.ts:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			return fail(500, { message: `Failed to update tribute: ${errorMessage}` });
		}
	}
};
