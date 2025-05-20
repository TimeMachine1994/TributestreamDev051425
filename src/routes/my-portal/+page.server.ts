import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/utils/auth';
import { getStrapiClient } from '$lib/server/strapi/client';

export const load: PageServerLoad = async (event) => {
  const { cookies } = event;

  // Get JWT and check user authentication
  const jwt = cookies.get('jwt');
  const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;

  if (!userJwt) {
    // Redirect to login if not authenticated
    throw redirect(302, '/login');
  }

  // Fetch tributes for the user
  const strapiClient = getStrapiClient(event);
  const tributes = await strapiClient.collection('tributes').find();

  return {
    tributes: tributes.data,
    user: userJwt
  };
};