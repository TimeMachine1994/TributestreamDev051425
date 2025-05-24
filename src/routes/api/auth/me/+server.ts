import type { RequestHandler } from './$types';
import { strapiFetch } from '$lib/server/strapi/rest-api';
import { mapStrapiUserToAppUser } from '$lib/server/strapi/user';
import type { User } from '$lib/types/types';
import type { PluginUsersPermissionsUser } from '$lib/types/generated/contentTypes.d.ts';

export const GET: RequestHandler = async (event) => {
    const authHeader = event.request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('/api/auth/me: Authorization header missing or malformed');
        return new Response(JSON.stringify({ error: 'Authorization header missing or malformed' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = authHeader.substring(7); // "Bearer ".length

    try {
        console.log(`/api/auth/me: Attempting to fetch user with token.`);
        const strapiUser = await strapiFetch<PluginUsersPermissionsUser>(
            'users/me?populate=role',
            {},      // Default options for GET
            event,   // Pass SvelteKit event
            token    // Override token
        );
        console.log('Successfully fetched user from Strapi for /api/auth/me');

        const appUser: User = mapStrapiUserToAppUser(strapiUser);
        console.log('/api/auth/me: Successfully mapped Strapi user to app user.');

        return new Response(JSON.stringify(appUser), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        // Log the full error for server-side debugging, regardless of what's sent to client
        console.error('Error in /api/auth/me endpoint. Details:', error);

        if (error && typeof error.status === 'number') {
            if (error.status === 401 || error.status === 403) {
                console.log(`/api/auth/me: Strapi returned ${error.status}. Responding with specific error.`);
                return new Response(JSON.stringify({ error: 'Invalid token or insufficient permissions' }), {
                    status: error.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (error.status === 404) {
                console.log(`/api/auth/me: Strapi returned 404. Responding with 404.`);
                return new Response(JSON.stringify({ error: 'User not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // For other Strapi errors with a status (e.g., 400, 500, 502 from Strapi),
            // these are considered "unexpected" for this route's specific contract
            // and will fall through to the generic 500 error response below.
            console.log(`/api/auth/me: Strapi returned unhandled status ${error.status}. Treating as internal server error.`);
        } else {
             // This case handles non-HTTP errors from strapiFetch (e.g. network issue before HTTP response)
             // or errors from mapStrapiUserToAppUser.
            console.log('/api/auth/me: Encountered non-HTTP error or error during mapping. Treating as internal server error.');
        }

        // Default for all unhandled cases (including fall-through from above)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};