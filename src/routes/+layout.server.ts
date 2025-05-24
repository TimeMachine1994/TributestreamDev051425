import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    // The user object is populated in hooks.server.ts
    // and available via event.locals.user
    console.log('[+layout.server.ts] Returning user from event.locals:', event.locals.user);
    return {
        user: event.locals.user
    };
};