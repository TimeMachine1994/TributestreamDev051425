import type { Handle } from '@sveltejs/kit';
import { getTokenName, verifyJwt } from '$lib/server/auth/jwt';

/**
 * Server hook for handling authentication state
 * Validates JWT tokens and manages authenticated user state
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookies
    const token = event.cookies.get(getTokenName());

    if (token) {
        const user = verifyJwt(token);
        if (user) {
            event.locals.user = user;
            console.log('🔐 Authenticated user:', user.email);
        } else {
            console.warn('⚠️ Invalid JWT token');
        }
    }
    
    // Continue with the request
    return await resolve(event);
};