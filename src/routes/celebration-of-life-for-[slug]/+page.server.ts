import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Server load function for tribute pages
 * Fetches tribute data for a specific slug from the WordPress API
 */
export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    try {
        const slug = params.slug;
        
        if (!slug) {
            throw error(404, 'Tribute not found');
        }
        
        console.log(`🔍 Loading tribute data for slug: ${slug}`);
        
        // Headers object for API requests
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        
        // Add authentication token if available
        if (locals.token) {
            headers['Authorization'] = `Bearer ${locals.token}`;
        }
        
        // Fetch tribute data from WordPress API
        const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`, {
            method: 'GET',
            headers
        });
        
        // Handle API errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Error fetching tribute:', errorData);
            
            if (response.status === 404) {
                throw error(404, 'Tribute not found');
            } else {
                throw error(response.status, errorData.message || 'Failed to load tribute');
            }
        }
        
        // Parse response data
        const tribute = await response.json();
        console.log('✅ Tribute data loaded successfully');
        
        return {
            tribute,
            isAuthenticated: !!locals.authenticated,
            isOwner: locals.user?.id === tribute.user_id
        };
    } catch (err) {
        console.error('🚨 Error in tribute page load function:', err);
        
        // If err is already a SvelteKit error, rethrow it
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        
        // Otherwise create a new error
        throw error(500, 'Error loading tribute data');
    }
};