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
export function mapStrapiUserToAppUser(
	strapiUserData: StrapiUserEntity | PluginUsersPermissionsUser | null | undefined
): User | null {
	if (!strapiUserData) return null;

	// Strapi's /users/me endpoint returns the user object directly (PluginUsersPermissionsUser).
	// Strapi's /users/:id endpoint returns { data: StrapiUserEntity }.
	const isDirectUserObject = 'username' in strapiUserData && !('attributes' in strapiUserData);

	// Ensure 'id' is correctly accessed. If PluginUsersPermissionsUser type is missing id, this 'as any' is a temporary workaround.
	const id = isDirectUserObject
	   ? (strapiUserData as any).id
	   : (strapiUserData as StrapiUserEntity).id;
	
	const attributesSource = isDirectUserObject ? strapiUserData : strapiUserData.attributes;

	if (!attributesSource) return null;

	let appRole: User['role'] = undefined;
	const strapiRoleData = attributesSource.role; // role is on attributesSource now

	if (strapiRoleData) {
		// Case A: strapiRoleData is { data: StrapiUserRoleEntity }
		if ('data' in strapiRoleData && strapiRoleData.data) {
			const roleEntityFromData = strapiRoleData.data;
			appRole = {
				id: String(roleEntityFromData.id),
				name: roleEntityFromData.attributes.name,
				type: roleEntityFromData.attributes.type || '',
			};
		}
		// Case B: strapiRoleData is StrapiUserRoleEntity (has 'id' and 'attributes' directly)
		else if ('attributes' in strapiRoleData && 'id' in strapiRoleData) {
			const roleEntityDirect = strapiRoleData as StrapiUserRoleEntity;
			appRole = {
				id: String(roleEntityDirect.id),
				name: roleEntityDirect.attributes.name,
				type: roleEntityDirect.attributes.type || '',
			};
		}
		// Case C: Fallback for a flat role object if it somehow bypasses typing (e.g. PluginUsersPermissionsRole)
		// This assumes 'id', 'name', 'type' are direct properties.
		else if ('name' in strapiRoleData && 'type' in strapiRoleData && 'id' in (strapiRoleData as any)) {
			 appRole = {
				id: String((strapiRoleData as any).id),
				name: (strapiRoleData as any).name,
				type: (strapiRoleData as any).type || '',
			};
		}
	}
	
	return {
		id: String(id),
		username: attributesSource.username,
		email: attributesSource.email,
		fullName: attributesSource.fullName || undefined,
		phoneNumber: attributesSource.phoneNumber || undefined,
		role: appRole,
		// confirmed: attributesSource.confirmed, // Add if present in your app's User type
		// blocked: attributesSource.blocked,   // Add if present in your app's User type
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
			redirect: 'manual', // Prevent event.fetch from automatically following redirects
		});

		// If response is a redirect (status 300-399), or not ok for other reasons
		if (response.status >= 300 && response.status < 400) {
			console.warn(
				`[getCurrentUser] /api/auth/me responded with a redirect (status: ${response.status}). This might indicate an issue. Returning null.`
			);
			// Log redirect location if available
			const location = response.headers.get('location');
			if (location) {
				console.warn(`[getCurrentUser] Redirect location: ${location}`);
			}
			return null;
		}

		if (!response.ok) {
			const errorBody = await response.text().catch(() => "Could not retrieve error body");
			if (response.status === 401 || response.status === 403) {
				console.warn(
					`[getCurrentUser] /api/auth/me responded with ${response.status}. Invalid/expired token or insufficient permissions. JWT: ${jwt ? jwt.substring(0, 20) + "..." : "N/A"}. Body: ${errorBody}. Returning null.`
				);
			} else {
				console.error(
					`[getCurrentUser] Error fetching current user from /api/auth/me: ${response.status} ${response.statusText}. JWT: ${jwt ? jwt.substring(0, 20) + "..." : "N/A"}. Body: ${errorBody}. Returning null.`
				);
			}
			return null;
		}

		try {
			const user: User | null = await response.json();
			if (user && user.id) { // Basic check for a valid user object
				console.log(`[getCurrentUser] Successfully fetched user from /api/auth/me. User ID: ${user.id}. Returning user.`);
			} else {
				console.warn(`[getCurrentUser] /api/auth/me response was OK, but user data is null or lacks ID. Response: ${JSON.stringify(user)}. Returning null.`);
				return null; // Ensure we return null if user data is not as expected
			}
			return user;
		} catch (jsonError: any) {
			console.error(`[getCurrentUser] Failed to parse JSON response from /api/auth/me: ${jsonError.message}. JWT: ${jwt ? jwt.substring(0, 20) + "..." : "N/A"}. Returning null.`, jsonError);
			return null;
		}

	} catch (error: any) {
		console.error(`[getCurrentUser] Exception during call to /api/auth/me: ${error.message}. JWT: ${jwt ? jwt.substring(0, 20) + "..." : "N/A"}. Returning null.`, error);
		return null;
	}
}
