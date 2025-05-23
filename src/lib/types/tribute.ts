import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';
import type { PluginUsersPermissionsUser } from './generated/contentTypes'; // For owner type

export type Status = 'draft' | 'published' | 'archived';

// Attributes as defined in Strapi, including relations which might be populated
export type StrapiTributeAttributes = ApiTributeTribute['attributes'] & {
	// Explicitly define how relations like 'owner' might look when populated
	// This depends on your Strapi setup and what you populate.
	// Example: owner might be a full User object or just its ID.
	owner?: { data: StrapiUserEntity | null }; // Assuming owner is a User
};

// Structure of a single Tribute entity from Strapi v5 response
export interface StrapiTributeEntity {
	id: number;
	attributes: StrapiTributeAttributes;
}

// Structure for a single tribute response from Strapi v5
export interface StrapiSingleTributeResponse {
	data: StrapiTributeEntity | null;
	meta?: Record<string, unknown>;
}

// Structure for a collection of tributes response from Strapi v5
export interface StrapiTributeCollectionResponse {
	data: StrapiTributeEntity[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

// Define Strapi User Entity structure if not already available globally
// This is a simplified version; adjust based on your actual User type from Strapi
export interface StrapiUserAttributes {
	username: string;
	email: string;
	// Add other user attributes you expect
	[key: string]: any; // Allow other attributes
}

export interface StrapiUserEntity {
	id: number;
	attributes: StrapiUserAttributes;
}


// Your application's internal Tribute type.
// This is what your Svelte components and other app logic will primarily use.
// It can be a flattened version of StrapiTributeEntity.
export interface Tribute {
	id: string; // Using string ID for consistency in the app, will map from number
	name: string;
	description?: string;
	slug: string;
	status: Status;
	owner?: {
		id: string;
		username?: string;
		email?: string;
		// other relevant owner fields
	} | null;
	createdAt?: string;
	updatedAt?: string;
	// Add any other fields from StrapiTributeAttributes you need directly on this type
}

// Your application's PaginationMeta, derived from Strapi's structure
export type PaginationMeta = StrapiTributeCollectionResponse['meta']['pagination'];

// Helper function to map a StrapiTributeEntity to your application's Tribute type
export function mapStrapiTributeToAppTribute(entity: StrapiTributeEntity | null): Tribute | null {
	if (!entity) return null;

	const { id, attributes } = entity;

	// Basic mapping
	const appTribute: Tribute = {
		id: String(id),
		name: attributes.name,
		slug: attributes.slug,
		status: attributes.status as Status, // Cast if type is certain
		description: attributes.description || undefined,
		createdAt: attributes.createdAt,
		updatedAt: attributes.updatedAt,
		owner: null // Default to null
	};

	// Handle populated owner relation
	if (attributes.owner && attributes.owner.data) {
		const ownerEntity = attributes.owner.data;
		appTribute.owner = {
			id: String(ownerEntity.id),
			username: ownerEntity.attributes.username,
			email: ownerEntity.attributes.email
			// Map other relevant owner attributes
		};
	}
	
	return appTribute;
}

// Type for input when creating/updating tributes (subset of attributes)
// This should align with the fields you actually send in POST/PUT requests
export type TributeInputAttributes = Partial<Omit<StrapiTributeAttributes, 'createdAt' | 'updatedAt' | 'publishedAt' | 'owner' | 'locale' | 'localizations' | 'createdBy' | 'updatedBy'> & {
	owner?: number | string; // Allow sending owner ID
}>;
