import { strapiFetch } from './rest-api';
import type { User } from '../../types/types'; // Application's User type
import type { RequestEvent } from '@sveltejs/kit';
import type {
	PluginUsersPermissionsUser,
	PluginUsersPermissionsRole
} from '../../types/generated/contentTypes.d.ts'; // Strapi's generated types

// Strapi's raw User Role attributes (subset of PluginUsersPermissionsRole['attributes'])
interface StrapiUserRoleAttributes {
	name: string;
	description?: string;
	type?: string; // The role key e.g. 'authenticated', 'public', 'custom_role'
	// other role attributes if needed
}

// Strapi's User Role entity structure when populated
interface StrapiUserRoleEntity {
	id: number;
	attributes: StrapiUserRoleAttributes;
}

// Strapi's raw User attributes (subset of PluginUsersPermissionsUser['attributes'])
// This is what Strapi returns, especially for /users/me or populated relations
type StrapiUserAttributes = PluginUsersPermissionsUser['attributes'] & {
	// Role can be directly populated (e.g. /users/me) or nested under 'data' (e.g. /users/:id?populate=role)
	role?: StrapiUserRoleEntity | { data: StrapiUserRoleEntity | null };
};

// Strapi's User entity structure (when fetched as a resource, e.g. /api/users/:id)
interface StrapiUserEntity {
	id: number;
	attributes: StrapiUserAttributes;
}

// Response type for single user GET requests (e.g., /api/users/:id)
interface StrapiSingleUserResponse {
	data: StrapiUserEntity | null;
	meta?: Record<string, unknown>;
}

// Helper to map Strapi User (from various possible structures) to Application User type
function mapStrapiUserToAppUser(
	strapiUserData: StrapiUserEntity | PluginUsersPermissionsUser | null | undefined
): User | null {
	if (!strapiUserData) return null;

	// Strapi's /users/me endpoint returns the user object directly (PluginUsersPermissionsUser).
	// Strapi's /users/:id endpoint returns { data: StrapiUserEntity }.
	const isDirectUserObject = 'username' in strapiUserData && !('attributes' in strapiUserData);
	
	const id = strapiUserData.id;
	const attributes = isDirectUserObject ? strapiUserData : strapiUserData.attributes;

	if (!attributes) return null;

	let appRole: User['role'] = undefined;
	const strapiRoleData = attributes.role;

	if (strapiRoleData) {
		// Case 1: Role is directly on attributes (e.g., from /users/me?populate=role)
		if ('name' in strapiRoleData && 'type' in strapiRoleData) { // Check for role attributes directly
			appRole = {
				id: String((strapiRoleData as StrapiUserRoleEntity).id), // Cast to access id if it's a full entity
				name: (strapiRoleData as StrapiUserRoleEntity).name,
				type: (strapiRoleData as StrapiUserRoleEntity).type || '',
			};
		}
		// Case 2: Role is nested under 'data' (e.g., from /users/:id?populate=role)
		else if ('data' in strapiRoleData && strapiRoleData.data) {
			appRole = {
				id: String(strapiRoleData.data.id),
				name: strapiRoleData.data.attributes.name,
				type: strapiRoleData.data.attributes.type || '',
			};
		}
	}
	
	return {
		id: String(id),
		username: attributes.username,
		email: attributes.email,
		fullName: attributes.fullName || undefined,
		phoneNumber: attributes.phoneNumber || undefined,
		role: appRole,
		// confirmed: attributes.confirmed, // Add if present in your app's User type
		// blocked: attributes.blocked,   // Add if present in your app's User type
	};
}

// For creating a user, Strapi expects a flat object for /api/users or /api/auth/local/register
// Role should be an ID.
type StrapiUserCreationPayload = Partial<Omit<PluginUsersPermissionsUser['attributes'], 'role' | 'createdAt' | 'updatedAt' | 'confirmed' | 'blocked' | 'provider' | 'resetPasswordToken' | 'confirmationToken' | 'tributes' | 'funeralHome' | 'createdBy' | 'updatedBy' | 'localizations' | 'locale' | 'publishedAt' >> & {
	password?: string; // Password is required for creation
	role?: number;     // Role ID
	confirmed?: boolean;
	blocked?: boolean;
};


export async function createUser(data: User & { password?: string }, event: RequestEvent): Promise<User | null> {
	const payload: StrapiUserCreationPayload = {
		username: data.username,
		email: data.email,
		password: data.password, // Password should be provided in 'data'
		fullName: data.fullName,
		phoneNumber: data.phoneNumber,
		confirmed: true, // Default to confirmed, adjust as needed by your application logic
		blocked: false,
		role: data.role?.id ? Number(data.role.id) : undefined, // Map app role ID (string) to Strapi role ID (number)
	};

	if (!payload.password) {
		throw new Error("Password is required to create a user.");
	}

	try {
		// Strapi's /api/users endpoint for creation returns the created user object directly (not wrapped in 'data')
		// If using /api/auth/local/register, the response includes { jwt, user }
		const strapiUser = await strapiFetch<PluginUsersPermissionsUser>(
			'/users', // Or '/auth/local/register' if it's user self-registration
			{
				method: 'POST',
				body: JSON.stringify(payload),
			},
			event // Pass event for token if an admin is creating a user and needs auth
		);
		return mapStrapiUserToAppUser(strapiUser);
	} catch (error) {
		console.error('Error creating user via REST:', error);
		throw error;
	}
}

export async function getUserById(id: string, event: RequestEvent): Promise<User | null> {
	try {
		// /api/users/:id returns { data: StrapiUserEntity }
		const response = await strapiFetch<StrapiSingleUserResponse>(
			`/users/${id}?populate=role`, // Ensure role is populated
			{ method: 'GET' },
			event
		);
		return mapStrapiUserToAppUser(response.data);
	} catch (error: any) {
		if (error.status === 404) {
			console.warn(`User with ID ${id} not found.`);
			return null;
		}
		console.error(`Error fetching user by ID ${id} via REST:`, error);
		throw error;
	}
}

// For updating a user, Strapi expects a flat object for /api/users/:id
type StrapiUserUpdatePayload = Partial<Omit<PluginUsersPermissionsUser['attributes'], 'role' | 'password' | 'provider' | 'confirmed' | 'blocked' | 'resetPasswordToken' | 'confirmationToken' | 'createdAt' | 'updatedAt' | 'tributes' | 'funeralHome' | 'createdBy' | 'updatedBy' | 'localizations' | 'locale' | 'publishedAt'>> & {
	role?: number | null; // Role ID or null to unset
	password?: string;    // Password can be updated but often a separate flow
};

export async function updateUser(id: string, data: Partial<User>, event: RequestEvent): Promise<User | null> {
	const payload: StrapiUserUpdatePayload = {};
	// Map relevant fields from app User type to Strapi update payload
	if (data.username !== undefined) payload.username = data.username;
	if (data.email !== undefined) payload.email = data.email;
	if (data.fullName !== undefined) payload.fullName = data.fullName;
	if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber;
	// Add other updatable fields as necessary

	if (data.role !== undefined) {
		payload.role = data.role?.id ? Number(data.role.id) : null; // Allow unsetting role
	}
	if ((data as any).password) { // If password needs to be updated
		payload.password = (data as any).password;
	}

	try {
		// Strapi's /api/users/:id for PUT returns the updated user object directly
		const updatedStrapiUser = await strapiFetch<PluginUsersPermissionsUser>(
			`/users/${id}`,
			{
				method: 'PUT',
				body: JSON.stringify(payload),
			},
			event
		);
		return mapStrapiUserToAppUser(updatedStrapiUser);
	} catch (error) {
		console.error(`Error updating user ${id} via REST:`, error);
		throw error;
	}
}

export async function deleteUser(id: string, event: RequestEvent): Promise<User | null> {
	try {
		// Strapi's /api/users/:id for DELETE returns the deleted user object directly
		const deletedStrapiUser = await strapiFetch<PluginUsersPermissionsUser>(
			`/users/${id}`,
			{ method: 'DELETE' },
			event
		);
		return mapStrapiUserToAppUser(deletedStrapiUser);
	} catch (error) {
		console.error(`Error deleting user ${id} via REST:`, error);
		throw error;
	}
}

export async function getCurrentUser(jwt: string, event: RequestEvent): Promise<User | null> {
	if (!jwt) return null;
	try {
		// Fetch the current user data from an internal SvelteKit API endpoint
		const response = await event.fetch('/api/auth/me', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${jwt}`,
			},
		});

		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				console.warn(
					`Attempt to get current user via /api/auth/me resulted in ${response.status}. Invalid/expired token or insufficient permissions.`
				);
				return null;
			}
			const errorBody = await response.text();
			console.error(
				`Error fetching current user from /api/auth/me: ${response.status} ${response.statusText}`,
				errorBody
			);
			// Optionally, throw an error or handle it as per your application's needs
			// For now, returning null for any non-successful response other than 401/403
			return null; 
		}

		const user: User | null = await response.json();
		return user;
	} catch (error: any) {
		console.error('Error in getCurrentUser calling /api/auth/me:', error);
		// Re-throw for other unexpected errors or return null
		// throw error; // Or handle more gracefully
		return null;
	}
}
