import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
// Removed getUserFromJwt as we are using locals.user
import { updateTribute as strapiUpdateTribute } from '$lib/server/strapi/tribute';
import type { Tribute, Status, TributeInputAttributes } from '$lib/types/tribute'; // Added TributeInputAttributes
// Strapi's client typically returns data where each item has an id and attributes.
// We can use a more generic type or a specific one if available from generated types.
// import type { ApiTributeTribute } from '$lib/types/generated/contentTypes'; // Not directly used here now

export const load: PageServerLoad = async (event) => { // event includes locals
  const { locals } = event; // Destructure locals, cookies not directly needed here anymore for JWT

  if (!locals.user) { // Check locals.user directly
    console.log('Redirecting to /login because locals.user is not set.');
    throw redirect(302, '/login');
  }

  // Use locals.user as the source of truth for the user object
  const user = locals.user;

  // Fetch tributes
  const fetchResponse = await event.fetch('/api/tributes?populate=*');

  if (!fetchResponse.ok) {
    const errorBody = await fetchResponse.text();
    console.error(`Failed to fetch tributes: ${fetchResponse.status}`, errorBody);
    throw error(fetchResponse.status, `Failed to load tributes: ${errorBody}`);
  }

  const tributesApiResponse = await fetchResponse.json();
  
  // The /api/tributes endpoint (using searchTributes) should already return data
  // in the shape of Tribute[] (mapped via mapStrapiTributeToAppTribute).
  // So, the complex mapping here is no longer needed and was causing type errors.
  const tributesData: Tribute[] = (tributesApiResponse.tributes || []) as Tribute[];

  return {
    tributes: tributesData,
    user: user // Use the user from locals
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
