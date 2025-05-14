// src/routes/api/tributes/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

// Base WordPress API URL
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';

/**
 * GET handler for tributes list
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ request, cookies, url }) => {
    console.log('🚀 [Tributes API] GET request received.');
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    // Forward query parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of url.searchParams) {
        queryParams.append(key, value);
    }
    
    // Build the WordPress API URL
    const wpApiUrl = `${WP_API_BASE}/tribute-pages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    try {
        // Make request to WordPress API
        const response = await fetch(wpApiUrl, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });
        
        // Get response data
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({ message: data.message || 'Failed to fetch tributes' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            tributes: data.data?.tributes || [],
            total_pages: data.data?.total_pages || 1,
            current_page: data.data?.current_page || 1
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while fetching tributes:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};

/**
 * POST handler for creating a new tribute
 * Forwards the request to the WordPress API and returns the response
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('🚀 [Tributes API] POST request received.');
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    // Check if user is authenticated
    if (!token) {
        return json({ message: 'Authentication required' }, { status: 401 });
    }
    
    try {
        // Parse request body
        const requestBody = await request.json();
        
        // Make request to WordPress API
        const response = await fetch(`${WP_API_BASE}/tribute-pages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // Get response data
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({ message: data.message || 'Failed to create tribute' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            tribute_id: data.data?.tribute_id,
            slugified_name: data.data?.slugified_name
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while creating tribute:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};