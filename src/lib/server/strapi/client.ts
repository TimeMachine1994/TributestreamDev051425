import { strapi as createStrapiClient } from '@strapi/client';
import { env } from '$env/dynamic/private';

import type { RequestEvent } from '@sveltejs/kit';

export function getStrapiClient(event: RequestEvent) {
  const jwt = event.cookies.get('jwt');
  console.log('🍪 JWT from cookie:', jwt);

  return createStrapiClient({
    baseURL: env.STRAPI_API_URL,
    auth: jwt ?? undefined
  });
}