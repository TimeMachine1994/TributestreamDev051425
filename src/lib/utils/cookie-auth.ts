import type { Cookies } from '@sveltejs/kit';

/**
 * Interface for user data stored in cookies
 */
export interface User {
  id: string;
  name: string;
  email: string;
  display_name?: string;
  roles?: string[];
  capabilities?: Record<string, boolean>;
}

/**
 * Sets the authentication cookie with JWT token
 * @param cookies The cookies object from the event
 * @param token JWT token
 * @param user User data
 */
export function setAuthCookie(cookies: Cookies, token: string, user: User): void {
  // Set JWT token cookie (httpOnly for security)
  cookies.set('jwt_token', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  
  // Set user info cookie (not httpOnly so client JS can access)
  cookies.set('user', JSON.stringify(user), {
    path: '/',
    httpOnly: false,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

/**
 * Clears authentication cookies
 * @param cookies The cookies object from the event
 */
export function clearAuthCookies(cookies: Cookies): void {
  cookies.delete('jwt_token', { path: '/' });
  cookies.delete('user', { path: '/' });
}

/**
 * Gets the JWT token from cookies
 * @param cookies The cookies object from the event
 * @returns JWT token or null if not found
 */
export function getTokenFromCookie(cookies: Cookies): string | null {
  return cookies.get('jwt_token') || null;
}

/**
 * Gets the user data from cookies
 * @param cookies The cookies object from the event
 * @returns User data or null if not found
 */
export function getUserFromCookie(cookies: Cookies): User | null {
  const userCookie = cookies.get('user');
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie) as User;
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Validates a JWT token with the WordPress endpoint
 * @param token JWT token to validate
 * @returns Whether the token is valid
 */
/**
 * TODO: Replace with Strapi-based token validation
 */
/*
export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating JWT token:', error);
    return false;
  }
}
*/

/**
 * Formats user data from WordPress response
 * @param data WordPress response data
 * @returns Formatted user data
 */
/**
 * TODO: Replace with Strapi-based user formatting
 */
/*
export function formatUserData(data: any): User {
  return {
    id: data.user_id || data.id,
    name: data.user_display_name,
    display_name: data.user_display_name,
    email: data.user_email,
    roles: data.roles || [],
    capabilities: data.capabilities || {}
  };
}
*/