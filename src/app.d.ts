// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/types').User | null;
			strapi: any;
		}
		
		interface PageState {
			showModal?: boolean;
			selected?: any;
		}
		
		interface Error {
			code?: string;
			message: string;
		}
	}
}

export {};
