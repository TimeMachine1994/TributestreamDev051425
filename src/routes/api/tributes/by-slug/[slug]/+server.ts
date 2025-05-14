// src/routes/api/tributes/by-slug/[slug]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

// Base WordPress API URL
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';

/**
 * GET handler for fetching a tribute by slug
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
    console.log(`🚀 [Tributes API] GET request received for tribute slug: ${params.slug}`);
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    try {
        // Make request to WordPress API
        const response = await fetch(`${WP_API_BASE}/tribute-pages/by-slug/${params.slug}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });
        
        // Get response data
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({ message: data.message || 'Failed to fetch tribute by slug' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            tribute: data.data
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while fetching tribute by slug:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};