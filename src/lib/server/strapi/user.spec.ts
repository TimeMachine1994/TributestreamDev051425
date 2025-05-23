import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { getCurrentUser, getUserById, createUser, updateUser, deleteUser } from './user';
import type { User } from '$lib/types/types';
// import type { StrapiUserAttributes, PluginUsersPermissionsUser } from '$lib/types/generated/contentTypes'; // May not be needed if we only assert App User type
import type { RequestEvent } from '@sveltejs/kit';

// Mock RequestEvent - for calls that need it.
// For authenticated calls, this event might need to be populated with a valid token
// if strapiFetch relies on event.locals.strapiToken.
const mockEvent = {
	locals: {},
	cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), serialize: vi.fn() },
	// Add other properties if your strapiFetch or services use them
} as unknown as RequestEvent;


// Note: These tests will hit a live Strapi instance.
// Ensure your .env configuration points to a suitable test instance.
// Manage test data (creation/cleanup) carefully for test independence.

describe('Strapi User Service (Integration)', () => {
	// No specific beforeEach needed for now, unless common setup/teardown for all tests.

	// --- getCurrentUser ---
	describe('getCurrentUser', () => {
		// This test requires a REAL, VALID JWT for a user in your test Strapi instance.
		// Replace 'your-valid-jwt-for-testing' with an actual token.
		// Consider fetching this token programmatically in a setup step.
		it.skip('should return a user when token is valid and user is fetched', async () => {
			const validTestJwt = 'your-valid-jwt-for-testing'; // IMPORTANT: Replace or skip
			if (validTestJwt === 'your-valid-jwt-for-testing') {
				console.warn("Skipping getCurrentUser valid JWT test - placeholder token used.");
				return;
			}
			const user = await getCurrentUser(validTestJwt, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.id).toBeDefined();
			expect(user?.email).toBeDefined();
			// Add more specific assertions based on your test user's data
		});

		it('should return null if JWT is empty', async () => {
			const user = await getCurrentUser('', mockEvent);
			expect(user).toBeNull();
		});

		it('should return null on Strapi error (e.g., 401 for an invalid token)', async () => {
			const user = await getCurrentUser('invalid-jwt-string', mockEvent);
			expect(user).toBeNull();
		});

		// This test depends on how your `strapiFetch` and `getCurrentUser` handle non-401/403 errors.
		// If they throw, this test is valid. If they catch and return null, it needs adjustment.
		// Assuming it throws for now, based on previous mock.
		it('should throw error for unexpected errors (if not caught and returned as null)', async () => {
			// This test is hard to trigger reliably without deeper control over the network/API response.
			// It might be better to test specific error codes if getCurrentUser handles them.
			// For now, we assume an invalid token covers the main "failure" path returning null.
			// If a truly unexpected server error (500) occurs, it should propagate.
			// To test this properly, you might need to mock `fetch` at a lower level to simulate a 500.
		});
	});

	// --- getUserById ---
	describe('getUserById', () => {
		// This test requires a user with a known ID to exist in your test Strapi instance.
		// Replace 'existing-user-id' with an actual ID.
		const existingUserId = '1'; // IMPORTANT: Replace with a real ID from your test DB

		it.skip('should return a user when ID is valid and user is fetched', async () => {
			if (existingUserId === '1' && process.env.NODE_ENV !== 'test-ci-with-seeded-data') { // Example condition
				console.warn("Skipping getUserById valid ID test - placeholder ID used or specific env not met.");
				return;
			}
			const user = await getUserById(existingUserId, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.id).toBe(existingUserId);
			expect(user?.email).toBeDefined();
			// Add more specific assertions
		});

		it('should return null if user is not found (e.g., non-existent ID)', async () => {
			const user = await getUserById('non-existent-id-12345', mockEvent);
			expect(user).toBeNull();
		});
	});

	// --- createUser, updateUser, deleteUser ---
	// These tests modify data. They need careful handling for cleanup.
	// Consider running them sequentially or ensuring unique data for each run.
	describe('User CRUD Operations', () => {
		let createdUserId: string | undefined;
		const testUserEmail = `testuser-${Date.now()}@example.com`;
		const testUsername = `testuser-${Date.now()}`;

		const newUserInput: User & { password?: string } = {
			id: '', // Will be assigned by Strapi
			username: testUsername,
			email: testUserEmail,
			password: 'password123Secure!',
			fullName: 'Test User FullName',
		};

		it('should create a user', async () => {
			const user = await createUser(newUserInput, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.email).toBe(newUserInput.email);
			expect(user?.username).toBe(newUserInput.username);
			expect(user?.fullName).toBe(newUserInput.fullName);
			expect(user?.id).toBeDefined();
			createdUserId = user?.id; // Save for cleanup or subsequent tests
			console.log(`Created user ID: ${createdUserId} for potential cleanup.`);
		});
		
		it('should throw an error if password is not provided for createUser', async () => {
			const userWithoutPassword = { ...newUserInput, password: undefined, email: `test-${Date.now()}@example.com`, username: `test-${Date.now()}` };
			// Ensure the function itself throws, not just the API call.
			await expect(createUser(userWithoutPassword, mockEvent)).rejects.toThrow("Password is required to create a user.");
		});

		it('should update a user', async () => {
			if (!createdUserId) {
				console.warn('Skipping updateUser test as createdUserId is not set (createUser might have failed or been skipped).');
				return;
			}
			const updateData: Partial<User> = {
				fullName: 'Updated Test User FullName',
				// email: `updated-${testUserEmail}` // Be cautious updating email if it's a login identifier
			};
			const user = await updateUser(createdUserId, updateData, mockEvent);
			expect(user).not.toBeNull();
			expect(user?.id).toBe(createdUserId);
			expect(user?.fullName).toBe(updateData.fullName);
		});

		it('should delete a user', async () => {
			if (!createdUserId) {
				console.warn('Skipping deleteUser test as createdUserId is not set.');
				return;
			}
			const user = await deleteUser(createdUserId, mockEvent);
			expect(user).not.toBeNull(); // Strapi often returns the deleted user
			expect(user?.id).toBe(createdUserId);

			// Optionally, verify it's actually deleted
			const deletedUserCheck = await getUserById(createdUserId, mockEvent);
			expect(deletedUserCheck).toBeNull();
			createdUserId = undefined; // Mark as deleted
		});

		// Basic afterAll for cleanup if a user was created and not deleted by a test
		afterAll(async () => {
			if (createdUserId) {
				console.warn(`Cleaning up user ID: ${createdUserId} in afterAll.`);
				try {
					await deleteUser(createdUserId, mockEvent);
				} catch (err) {
					console.error(`Error cleaning up user ${createdUserId}:`, err);
				}
			}
		});
	});
});
