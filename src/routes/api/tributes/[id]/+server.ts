// src/routes/api/tributes/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTokenFromCookie } from '$lib/utils/cookie-auth';

// Base WordPress API URL
const WP_API_BASE = 'https://wp.tributestream.com/wp-json/funeral/v2';

/**
 * GET handler for a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
    console.log(`🚀 [Tributes API] GET request received for tribute ID: ${params.id}`);
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    try {
        // Make request to WordPress API
        const response = await fetch(`${WP_API_BASE}/tribute-pages/${params.id}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });
        
        // Get response data
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({ message: data.message || 'Failed to fetch tribute' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            ...data.data
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while fetching tribute:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};

/**
 * PUT handler for updating a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
    console.log(`🚀 [Tributes API] PUT request received for tribute ID: ${params.id}`);
    
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
        const response = await fetch(`${WP_API_BASE}/tribute-pages/${params.id}`, {
            method: 'PUT',
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
            return json({ message: data.message || 'Failed to update tribute' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            tribute_id: data.data?.tribute_id,
            slugified_name: data.data?.slugified_name
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while updating tribute:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};

/**
 * DELETE handler for removing a specific tribute by ID
 * Forwards the request to the WordPress API and returns the response
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
    console.log(`🚀 [Tributes API] DELETE request received for tribute ID: ${params.id}`);
    
    // Get token from cookies
    const token = getTokenFromCookie(cookies);
    
    // Check if user is authenticated
    if (!token) {
        return json({ message: 'Authentication required' }, { status: 401 });
    }
    
    try {
        // Make request to WordPress API
        const response = await fetch(`${WP_API_BASE}/tribute-pages/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Get response data
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            console.error('❌ [Tributes API] WordPress returned an error:', data);
            return json({ message: data.message || 'Failed to delete tribute' }, { status: response.status });
        }
        
        // Return success response
        return json({
            success: true,
            deleted_id: params.id
        });
    } catch (error) {
        console.error('🚨 [Tributes API] Error occurred while deleting tribute:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};