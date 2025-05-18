import { jwtVerify, errors } from 'jose';
import { env } from '$env/dynamic/private';
import type { User } from '$lib/server/types';
import { getStrapiClient } from '$lib/server/strapi/client';

export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}
import type { RequestEvent } from '@sveltejs/kit';

export async function getUserFromToken(token: string, event: RequestEvent): Promise<User | null> {
  console.log('getUserFromToken called with token:', token);
  try {
    const rawSecret = env.STRAPI_JWT_SECRET;
    console.log('rawSecret from env:', rawSecret);
    if (!rawSecret) throw new Error('Missing STRAPI_JWT_SECRET');
    const secret = new TextEncoder().encode(rawSecret);
    console.log('secret (Uint8Array length):', secret.length);
    const result = await jwtVerify(token, secret);
    console.log('jwtVerify result:', result);
    const { payload } = result;
    console.log('payload:', payload);
    // extract the user ID
    const userId = (payload as any).id;
    // fetch full user record from Strapi
    console.log('fetching full user with ID:', userId);
    const strapi = getStrapiClient(event);
    const fullUserResponse = await strapi.collection('users').findOne(userId, {
      populate: ['role']
    });
    console.log('fullUserResponse from Strapi:', fullUserResponse);
    const fullUser = fullUserResponse as unknown as User;
    console.log('mapped fullUser:', fullUser);
    return fullUser;
  } catch (err) {
    console.error('getUserFromToken error:', err);
    if (err instanceof errors.JWTExpired) {
      throw new TokenExpiredError(err.message);
    }
    return null;
  }
}

export function extractTokenFromCookie(cookieString: string): string | null {
  console.log('extractTokenFromCookie called with cookieString:', cookieString);
  const token = cookieString?.match(/jwt=([^;]+)/)?.[1] || null;
  console.log('extractTokenFromCookie extracted token:', token);
  return token;
}