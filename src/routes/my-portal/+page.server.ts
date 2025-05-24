import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit'; // Removed 'error' as it's not used in the new load
import { getStrapiTributesByOwner, updateTribute as strapiUpdateTribute } from '$lib/server/strapi/tribute';
import { mapStrapiTributeToAppTribute, type Tribute, type Status, type TributeInputAttributes } from '$lib/types/tribute'; // Added TributeInputAttributes and ensured Tribute is a named import

// Strapi's client typically returns data where each item has an id and attributes.
// We can use a more generic type or a specific one if available from generated types.
// import type { ApiTributeTribute } from '$lib/types/generated/contentTypes'; // Not directly used here now

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user || !event.locals.user.id) {
    console.log('[my-portal/load] User not found or user ID missing, redirecting to /login.');
    throw redirect(303, '/login'); // Or your appropriate login route
  }

  try {
    const ownerId = Number(event.locals.user.id);
    const strapiResponse = await getStrapiTributesByOwner(ownerId, event);

    if (strapiResponse && strapiResponse.data) {
      const mappedTributes = strapiResponse.data
        .map(entity => mapStrapiTributeToAppTribute(entity))
        .filter(tribute => tribute !== null) as Tribute[]; // Ensure type assertion
      
      console.log(`[my-portal/load] Successfully fetched and mapped ${mappedTributes.length} tributes for user ${ownerId}`);
      return {
        tributes: mappedTributes,
        user: event.locals.user // Pass user data as well
      };
    } else {
      console.log(`[my-portal/load] No tributes found or empty response for user ${ownerId}`);
      return {
        tributes: [],
        user: event.locals.user
      };
    }
  } catch (error) {
    console.error('[my-portal/load] Error fetching tributes:', error);
    // It's good practice to check the type of error if you need to handle specific cases
    // For now, we'll return a generic error message.
    // const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      tributes: [],
      error: 'Failed to load tributes.', // Pass an error message to the page
      user: event.locals.user
    };
  }
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
		const tributeDataToUpdate: Partial<TributeInputAttributes> = {
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
