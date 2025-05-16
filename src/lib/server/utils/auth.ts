import { getUserFromToken as _getUserFromJwt } from '$lib/server/auth/jwt';
export async function getUserFromJwt(token: string) {


  
  return _getUserFromJwt(token);
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