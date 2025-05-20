import { getUserFromToken as _getUserFromJwt } from '$lib/utils/jwt';
import type { RequestEvent } from '@sveltejs/kit';

export async function getUserFromJwt(token: string, event: RequestEvent) {
  return _getUserFromJwt(token, event);
}

import { serialize } from 'cookie';

export function setAuthCookies(jwt: string, maxAgeSeconds: number): string[] {
  console.log('🍪 Setting auth cookies...');
  const options = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as 'lax',
    secure: true,
    maxAge: maxAgeSeconds
  };

  return [
    serialize('jwt', jwt, options),
    serialize('jwt_expires', String(Date.now() + maxAgeSeconds * 1000), {
      ...options,
      httpOnly: false,
      sameSite: 'lax' as 'lax'
    })
  ];
}
/**
 * Generates a secure random password of the specified length.
 * Includes uppercase, lowercase, digits, and symbols.
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}