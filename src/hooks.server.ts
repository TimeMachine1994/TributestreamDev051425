import type { Handle } from '@sveltejs/kit';
import { getUserFromJwt } from '$lib/server/utils/auth';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('jwt');

    if (token) {
        const user = await getUserFromJwt(token);
        event.locals.user = user;
    }

    return await resolve(event);
};
