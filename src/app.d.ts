// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authenticated?: boolean;
			token?: string;
			user?: {
				id: string;
				name: string;
				email: string;
				[key: string]: any;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Augment the Window interface for grecaptcha
	interface Window {
		grecaptcha: {
			ready: (callback: () => void) => void;
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

export {};
