import type { Handle } from '@sveltejs/kit';
import { getTokenFromCookie, getUserFromCookie, validateToken, clearAuthCookies } from '$lib/utils/cookie-auth';

/**
 * Server hook for handling authentication state
 * Validates JWT tokens and manages authenticated user state
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookies
    const token = getTokenFromCookie(event.cookies);
    
    if (token) {
        try {
            // Validate token with WordPress endpoint
            const isValid = await validateToken(token);
            
            if (isValid) {
                // If token is valid, set authenticated status in locals
                event.locals.authenticated = true;
                event.locals.token = token;
                
                // Also set user info if available
                const user = getUserFromCookie(event.cookies);
                if (user) {
                    event.locals.user = user;
                }
            } else {
                // If token validation fails, clear the cookies
                clearAuthCookies(event.cookies);
            }
        } catch (error) {
            console.error('Error validating JWT token:', error);
        }
    }
    
    // Continue with the request
    return await resolve(event);
};