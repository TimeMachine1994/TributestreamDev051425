import { redirect } from '@sveltejs/kit';
import { strapi } from '$lib/server/strapi/client';
import type { Actions, PageServerLoad } from './$types';
import type { User } from '$lib/server/types';
    
 
export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, '/login');
  }

  // extract and validate user role
  const role = (user as User).role.type;

  if (role === 'admin') {
    throw redirect(302, '/admin');
  }

  const validRoles = [
    'contributor',
    'funeral-director',
    'family-contact',
    'producer'
  ];

  if (!validRoles.includes(role)) {
    throw redirect(302, '/login');
  }
  
  const tributes = await strapi.collection('tributes').find({
    filters: { user: user.id }
  });
  
  return {
    user,
    tributes
  };
};
 
   