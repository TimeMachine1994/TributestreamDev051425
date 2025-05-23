import type { ApiTributeTribute } from '$lib/types/generated/contentTypes';
import type { PluginUsersPermissionsUser } from './generated/contentTypes'; // For owner type

export type Status = 'draft' | 'published' | 'archived';

// Attributes as defined in Strapi, including relations which might be populated
// StrapiTributeAttributes is based on the generated type for the main fields.
// For v5 collections, these fields are flat on the entity.
export type StrapiTributeBaseAttributes = ApiTributeTribute['attributes'];

// Represents the direct attributes of a user when populated in a v5 collection item
// Based on user's log and common user fields.
export interface StrapiV5FlatPopulatedOwner {
	id: number;
	documentId?: string;
	username: string;
	email: string;
	provider?: string;
	confirmed?: boolean;
	blocked?: boolean;
	fullName?: string;
	phoneNumber?: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
}

// Structure of a single Tribute entity from a Strapi v5 COLLECTION response
// Attributes are flat as per Strapi v5 documentation for collections.
// We Omit 'owner' from the base attributes because we're redefining it for the populated flat structure.
export interface StrapiTributeEntity extends Omit<StrapiTributeBaseAttributes, 'owner'> {
	id: number;
	documentId: string; // From user's log, specific to v5
	// All fields from StrapiTributeBaseAttributes (except 'owner')
	// are now direct properties of StrapiTributeEntity.
	owner?: StrapiV5FlatPopulatedOwner | null; // Populated owner directly and flat
}

// Structure for a single tribute response from Strapi v5
// NOTE: Single item responses in Strapi v5 *might* still use the nested 'attributes' structure.
// If so, this StrapiSingleTributeResponse and its usage of StrapiTributeEntity might need
// a different entity type or conditional logic. For now, we assume consistency or prioritize
// fixing the collection type which caused the error.
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
// StrapiUserAttributes and StrapiUserEntity might be for v4-style or single item v5 responses.
// For v5 populated relations in collections, we use StrapiV5FlatPopulatedOwner.
// These can be kept if single item responses differ, or refactored if v5 is consistently flat.
export interface StrapiUserAttributes {
	username: string;
	email: string;
	fullName?: string;
	phoneNumber?: string;
	// Add other user attributes you expect
	[key: string]: any; // Allow other attributes
}

export interface StrapiUserEntity { // This represents a user entity potentially with nested attributes
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
	if (!entity || typeof entity.id === 'undefined') { // Basic check for a valid entity object
		console.warn('mapStrapiTributeToAppTribute received null, undefined, or invalid entity. Entity:', JSON.stringify(entity, null, 2));
		return null;
	}

	// Log the entity to see its structure, especially if attributes is missing
	// This log helped identify the v5 flat structure.
	console.log('mapStrapiTributeToAppTribute - processing entity (v5 flat structure expected):', JSON.stringify(entity, null, 2));

	// For Strapi v5 collection items, attributes are direct properties of the entity.
	// Fallbacks for essential fields:
	const name = entity.name || `Unnamed Tribute (ID: ${entity.id})`;
	const slug = entity.slug || `untitled-slug-${entity.id}`;
	const status = (entity.status as Status) || 'draft';

	if (entity.name === undefined) console.warn(`Warning: Tribute ID ${entity.id} is missing 'name'. Using fallback.`);
	if (entity.slug === undefined) console.warn(`Warning: Tribute ID ${entity.id} is missing 'slug'. Using fallback.`);
	if (entity.status === undefined) console.warn(`Warning: Tribute ID ${entity.id} is missing 'status'. Using fallback.`);

	const appTribute: Tribute = {
		id: String(entity.id),
		name: name,
		slug: slug,
		status: status,
		description: entity.description || undefined,
		createdAt: entity.createdAt, // These come directly from the entity
		updatedAt: entity.updatedAt, // These come directly from the entity
		owner: null // Default to null
	};

	// Handle populated owner relation (which is also flat on the entity in v5 collections)
	if (entity.owner && typeof entity.owner === 'object' && typeof entity.owner.id !== 'undefined') {
		const ownerData = entity.owner; // ownerData is StrapiV5FlatPopulatedOwner
		appTribute.owner = {
			id: String(ownerData.id),
			username: ownerData.username, // Direct access
			email: ownerData.email,       // Direct access
			// Map other relevant owner attributes from ownerData if needed in Tribute['owner']
			// e.g., fullName: ownerData.fullName
		};
	} else if (entity.owner) { // If owner exists but is not a valid object with an id
		console.warn(`Tribute ID ${entity.id} has an 'owner' field but it's not a valid populated owner object. Owner field:`, JSON.stringify(entity.owner, null, 2));
	}
	
	return appTribute;
}

// Type for input when creating/updating tributes (subset of attributes)
// This should align with the fields you actually send in POST/PUT requests
// Uses StrapiTributeBaseAttributes now.
export type TributeInputAttributes = Partial<Omit<StrapiTributeBaseAttributes, 'createdAt' | 'updatedAt' | 'publishedAt' | 'owner' | 'locale' | 'localizations' | 'createdBy' | 'updatedBy'> & {
	owner?: number | string; // Allow sending owner ID
}>;
