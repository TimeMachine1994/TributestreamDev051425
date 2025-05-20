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
    sameSite: 'lax',
    secure: true,
    maxAge: maxAgeSeconds
  };

  return [
    serialize('jwt', jwt, options),
    serialize('jwt_expires', String(Date.now() + maxAgeSeconds * 1000), {
      ...options,
      httpOnly: false
    })
  ];
}