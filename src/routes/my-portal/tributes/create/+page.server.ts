import type { Actions, RequestEvent } from './$types';
import { fail } from '@sveltejs/kit';
import { createStrapiTribute } from '$lib/server/strapi/tribute';
import type { TributeInputAttributes } from '$lib/types/tribute';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export const actions: Actions = {
  createTribute: async (event: RequestEvent) => {
    const { request, locals } = event;
    // Authentication Check
    if (!locals.user || !locals.user.id) {
      return fail(401, { error: 'You must be logged in to create a tribute.' });
    }

    // Form Data Processing
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | undefined;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return fail(400, { error: 'Tribute name is required.' });
    }

    // Slug Generation
    const slug = generateSlug(name);

    // Description Handling
    const trimmedDescription = description?.trim();

    // Prepare Payload
    const tributeData: TributeInputAttributes = {
      name: name.trim(),
      slug: slug, // Add the generated slug
      description: (trimmedDescription && trimmedDescription.length >= 10) ? trimmedDescription : null,
      status: 'draft', // Default status
      owner: Number(locals.user.id) // Strapi expects owner ID as a number
    };

    // Call Strapi Service
    try {
      const newTribute = await createStrapiTribute(tributeData, event);
      
      if (newTribute) {
        // Success
        console.log('Tribute created successfully by action:', newTribute);
        // Optionally, redirect to the new tribute's page or a list page.
        // For now, just return a success message.
        return { success: true, message: 'Tribute created successfully!', tributeId: newTribute.id };
      } else {
        // This case might occur if createStrapiTribute returns null without throwing an error
        return fail(500, { error: 'Failed to create tribute. Strapi service returned null.' });
      }
    } catch (error: any) {
      console.error('Error in createTribute action:', error);
      // Check for specific Strapi error structures if possible, or return a generic error
      const errorMessage = error.response?.data?.error?.message || error.message || 'An unexpected error occurred while creating the tribute.';
      const errorStatus = error.status || 500;
      return fail(errorStatus, { error: errorMessage });
    }
  }
  // default: async (event) => { /* ... */ } // Will be implemented later
};