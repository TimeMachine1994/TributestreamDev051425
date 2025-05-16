import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Server load function for tribute pages
 * Fetches tribute data for a specific slug from the WordPress API
 */
export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    try {
        const slug = params.slug;
        // Call our Strapi API to get the tribute data. 
        // match the slugified name with the slug, and if good create a page with the data displayed to the user. 
        
    }
};