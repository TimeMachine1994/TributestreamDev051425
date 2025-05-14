import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserFromCookie, getTokenFromCookie, validateToken } from '$lib/utils/cookie-auth';

/**
 * Endpoint to check authentication status
 * This endpoint is used by the client to check if the user is authenticated
 * It returns user information if authenticated, or a 401 status if not
 */
export const GET: RequestHandler = async ({ cookies }) => {
  console.log('🔍 [Auth Check API] Checking authentication status');
  
  // Get token and user from cookies
  const token = getTokenFromCookie(cookies);
  const user = getUserFromCookie(cookies);
  
  // Validate token if it exists
  if (token && user) {
    try {
      const isValid = await validateToken(token);
      
      if (isValid) {
        console.log('✅ [Auth Check API] User is authenticated:', user.id);
        
        // Return user information
        return json({
          authenticated: true,
          user
        });
      }
    } catch (error) {
      console.error('❌ [Auth Check API] Error validating token:', error);
    }
  }
  
  console.log('❌ [Auth Check API] No authenticated user found or token invalid');
  return json({ authenticated: false }, { status: 401 });
};