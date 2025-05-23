import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, getUserById, createUser, updateUser, deleteUser } from './user';
import type { User } from '$lib/types/types';
import type { StrapiUserAttributes, PluginUsersPermissionsUser } from '$lib/types/generated/contentTypes'; // Using AdminUser as a placeholder for Strapi user structure
import type { RequestEvent } from '@sveltejs/kit';

// Mock strapiFetch
const mockStrapiFetch = vi.fn();
vi.mock('./rest-api', () => ({
	strapiFetch: mockStrapiFetch
}));

// Mock RequestEvent
const mockEvent = {} as RequestEvent;

describe('Strapi User Service', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- getCurrentUser ---
	describe('getCurrentUser', () => {
		it('should return a user when token is valid and user is fetched', async () => {
			const mockStrapiUserData: PluginUsersPermissionsUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				provider: 'local',
				confirmed: true,
				blocked: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				// role: { id: 1, name: 'Authenticated', type: 'authenticated' } // Example, adjust if your type has this structure
			};
			mockStrapiFetch.mockResolvedValue(mockStrapiUserData);

			const user = await getCurrentUser('valid-jwt', mockEvent);
			expect(user).not.toBeNull();
			expect(user?.email).toBe('test@example.com');
			expect(mockStrapiFetch).toHaveBeenCalledWith('/users/me?populate=role', {
				method: 'GET',
				token: 'valid-jwt'
			});
		});

		it('should return null if JWT is empty', async () => {
			const user = await getCurrentUser('', mockEvent);
			expect(user).toBeNull();
			expect(mockStrapiFetch).not.toHaveBeenCalled();
		});

		it('should return null on Strapi error (e.g., 401)', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 401, message: 'Unauthorized' });
			const user = await getCurrentUser('invalid-jwt', mockEvent);
			expect(user).toBeNull();
		});

		it('should throw error for non-401/403 errors', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 500, message: 'Server Error' });
			await expect(getCurrentUser('jwt', mockEvent)).rejects.toThrow('Server Error');
		});
	});

	// --- getUserById ---
	describe('getUserById', () => {
		it('should return a user when ID is valid and user is fetched', async () => {
			const mockStrapiUserEntity = {
				id: 2,
				attributes: {
					username: 'anotheruser',
					email: 'another@example.com',
					// confirmed: true, // attributes from PluginUsersPermissionsUser['attributes']
					// blocked: false,
					// provider: 'local',
					// createdAt: new Date().toISOString(),
					// updatedAt: new Date().toISOString(),
				}
			};
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiUserEntity });

			const user = await getUserById('2', mockEvent);
			expect(user).not.toBeNull();
			expect(user?.email).toBe('another@example.com');
			expect(mockStrapiFetch).toHaveBeenCalledWith('/users/2?populate=role', { method: 'GET' }, mockEvent);
		});

		it('should return null if user is not found (404)', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 404, message: 'Not Found' });
			const user = await getUserById('unknown-id', mockEvent);
			expect(user).toBeNull();
		});

		it('should throw error for other Strapi errors', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 500, message: 'Server Error' });
			await expect(getUserById('123', mockEvent)).rejects.toThrow('Server Error');
		});
	});

	// --- createUser ---
	describe('createUser', () => {
		const newUserInput: User & { password?: string } = {
			id: '', // Not used for creation input typically
			username: 'newbie',
			email: 'newbie@example.com',
			password: 'password123',
			fullName: 'New User',
		};

		it('should create and return a user', async () => {
			const createdStrapiUser: PluginUsersPermissionsUser = {
				id: 3,
				username: 'newbie',
				email: 'newbie@example.com',
				provider: 'local',
				confirmed: true,
				blocked: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				fullName: 'New User',
			};
			mockStrapiFetch.mockResolvedValue(createdStrapiUser);

			const user = await createUser(newUserInput, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.email).toBe('newbie@example.com');
			expect(user?.fullName).toBe('New User');
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				'/users',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(expect.objectContaining({
						username: 'newbie',
						email: 'newbie@example.com',
						password: 'password123',
						confirmed: true,
					}))
				}),
				mockEvent
			);
		});

		it('should throw an error if password is not provided', async () => {
			const userWithoutPassword = { ...newUserInput, password: undefined };
			await expect(createUser(userWithoutPassword, mockEvent)).rejects.toThrow("Password is required to create a user.");
		});
	});

	// --- updateUser ---
	describe('updateUser', () => {
		const userId = '3';
		const updateData: Partial<User> = {
			fullName: 'Updated Name',
			email: 'updated@example.com'
		};

		it('should update and return the user', async () => {
			const updatedStrapiUser: PluginUsersPermissionsUser = {
				id: Number(userId),
				username: 'newbie', // Assuming username doesn't change or is fetched
				email: 'updated@example.com',
				provider: 'local',
				confirmed: true,
				blocked: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				fullName: 'Updated Name',
			};
			mockStrapiFetch.mockResolvedValue(updatedStrapiUser);

			const user = await updateUser(userId, updateData, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.fullName).toBe('Updated Name');
			expect(user?.email).toBe('updated@example.com');
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				`/users/${userId}`,
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify({
						fullName: 'Updated Name',
						email: 'updated@example.com'
					})
				}),
				mockEvent
			);
		});
	});

	// --- deleteUser ---
	describe('deleteUser', () => {
		const userId = '3';
		it('should delete and return the user', async () => {
			const deletedStrapiUser: PluginUsersPermissionsUser = {
				id: Number(userId),
				username: 'newbie',
				email: 'deleted@example.com',
				provider: 'local',
				confirmed: true,
				blocked: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			mockStrapiFetch.mockResolvedValue(deletedStrapiUser);
			const user = await deleteUser(userId, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.id).toBe(userId);
			expect(mockStrapiFetch).toHaveBeenCalledWith(`/users/${userId}`, { method: 'DELETE' }, mockEvent);
		});
	});
});
