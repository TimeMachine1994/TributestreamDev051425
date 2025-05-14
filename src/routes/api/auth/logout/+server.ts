import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearAuthCookies } from '$lib/utils/cookie-auth';

/**
 * Endpoint to handle user logout
 * This endpoint clears the authentication cookies
 */
export const POST: RequestHandler = async ({ cookies }) => {
  console.log('🔄 [Auth Logout API] Processing logout request');
  
  // Clear auth cookies
  clearAuthCookies(cookies);
  
  console.log('✅ [Auth Logout API] Cookies cleared successfully');
  
  // Return success response
  return json({
    success: true,
    message: 'Logged out successfully'
  });
};