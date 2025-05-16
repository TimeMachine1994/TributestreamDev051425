import { strapi as createStrapiClient } from '@strapi/client';
import { env } from '$env/dynamic/private';

const strapi = createStrapiClient({
  baseURL: `${env.STRAPI_API_URL}/api`,
  auth: env.STRAPI_API_TOKEN!
});

export { strapi };