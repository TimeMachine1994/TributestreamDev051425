import { jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';
import type { User } from '$lib/server/auth/types';

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const rawSecret = env.STRAPI_JWT_SECRET;
    if (!rawSecret) throw new Error('Missing STRAPI_JWT_SECRET');
    const secret = new TextEncoder().encode(rawSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as User;
  } catch (err) {
    console.error('getUserFromToken error:', err);
    return null;
  }
}

export function extractTokenFromCookie(cookieString: string): string | null {
  return cookieString?.match(/jwt=([^;]+)/)?.[1] || null;
}