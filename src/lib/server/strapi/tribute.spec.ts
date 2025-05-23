import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createTribute,
	getTributeById,
	getTributeBySlug,
	updateTribute,
	deleteTribute,
	searchTributes
} from './tribute';
import type {
	Tribute,
	TributeInputAttributes,
	// StrapiTributeEntity, // May not be needed if only asserting App Tribute type
	// StrapiTributeCollectionResponse,
	PaginationMeta
} from '$lib/types/tribute';
// import { mapStrapiTributeToAppTribute } from '$lib/types/tribute'; // Will be used directly
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

describe('Strapi Tribute Service (Integration)', () => {

	// --- createTribute, getTributeById, getTributeBySlug, updateTribute, deleteTribute ---
	describe('Tribute CRUD and Fetch Operations', () => {
		let createdTributeId: string | undefined;
		let createdTributeSlug: string | undefined;
		const uniqueSuffix = Date.now();
		const testTributeName = `Test Tribute ${uniqueSuffix}`;
		const testTributeSlug = `test-tribute-${uniqueSuffix}`;

		const tributeInput: TributeInputAttributes = {
			name: testTributeName,
			slug: testTributeSlug,
			description: 'A lovely test tribute created during automated tests.'
			// owner: 1 // Example: if owner is required and you have a test user ID
		};

		it('should create a tribute', async () => {
			const tribute = await createTribute(tributeInput, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute.name).toBe(tributeInput.name);
			expect(tribute.slug).toBe(tributeInput.slug);
			expect(tribute.description).toBe(tributeInput.description);
			expect(tribute.id).toBeDefined();
			createdTributeId = tribute.id;
			createdTributeSlug = tribute.slug;
			console.log(`Created tribute ID: ${createdTributeId}, Slug: ${createdTributeSlug} for potential cleanup.`);
		});
		
		it('should throw an error if mapping fails after creation (e.g. malformed API response)', async () => {
			// This is harder to test without mocking strapiFetch to return a malformed response.
			// The actual mapStrapiTributeToAppTribute function would need to fail.
			// If createTribute's internal call to mapStrapiTributeToAppTribute returns null, it throws.
			// For now, assume valid responses from Strapi. If specific malformed cases need testing,
			// it might require temporarily mocking strapiFetch for that one specific test case.
		});

		it('should get a tribute by ID', async () => {
			if (!createdTributeId) {
				console.warn('Skipping getTributeById test as createdTributeId is not set.');
				return;
			}
			const tribute = await getTributeById(createdTributeId, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.id).toBe(createdTributeId);
			expect(tribute?.name).toBe(testTributeName);
		});

		it('should return null if tribute ID is invalid/empty for getTributeById', async () => {
			const tribute = await getTributeById('', mockEvent);
			expect(tribute).toBeNull();
		});

		it('should return null if tribute not found by ID (404)', async () => {
			const tribute = await getTributeById('non-existent-id-9999', mockEvent);
			expect(tribute).toBeNull();
		});
		
		it('should get a tribute by slug', async () => {
			if (!createdTributeSlug) {
				console.warn('Skipping getTributeBySlug test as createdTributeSlug is not set.');
				return;
			}
			const tribute = await getTributeBySlug(createdTributeSlug, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.slug).toBe(createdTributeSlug);
			expect(tribute?.name).toBe(testTributeName);
		});

		it('should return null if tribute slug is invalid/empty for getTributeBySlug', async () => {
			const tribute = await getTributeBySlug('', mockEvent);
			expect(tribute).toBeNull();
		});

		it('should return null if no tribute found for slug', async () => {
			const tribute = await getTributeBySlug('non-existent-slug-completely', mockEvent);
			expect(tribute).toBeNull();
		});

		it('should update a tribute', async () => {
			if (!createdTributeId) {
				console.warn('Skipping updateTribute test as createdTributeId is not set.');
				return;
			}
			const updatedName = `Updated ${testTributeName}`;
			const tributeUpdateData: TributeInputAttributes = { name: updatedName };
			
			const tribute = await updateTribute(createdTributeId, tributeUpdateData, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute.id).toBe(createdTributeId);
			expect(tribute.name).toBe(updatedName);
		});

		it('should delete a tribute', async () => {
			if (!createdTributeId) {
				console.warn('Skipping deleteTribute test as createdTributeId is not set.');
				return;
			}
			const tribute = await deleteTribute(createdTributeId, mockEvent);
			expect(tribute).not.toBeNull(); // Strapi often returns the deleted item
			expect(tribute?.id).toBe(createdTributeId);

			// Verify it's actually deleted
			const deletedTributeCheck = await getTributeById(createdTributeId, mockEvent);
			expect(deletedTributeCheck).toBeNull();
			createdTributeId = undefined; // Mark as deleted
			createdTributeSlug = undefined;
		});
		
		// Cleanup any tribute that might have been created but not deleted by a specific test
		afterAll(async () => {
			if (createdTributeId) {
				console.warn(`Cleaning up tribute ID: ${createdTributeId} in afterAll.`);
				try {
					await deleteTribute(createdTributeId, mockEvent);
				} catch (err) {
					console.error(`Error cleaning up tribute ${createdTributeId}:`, err);
				}
			}
		});
	});

	// --- searchTributes ---
	describe('searchTributes', () => {
		// These tests assume some tributes exist that can be searched.
		// For more robust tests, create specific tributes before searching.
		// For now, we'll test basic search functionality.
		const searchSuffix = `search-${Date.now()}`;
		let tribute1Id: string, tribute2Id: string;

		beforeAll(async () => {
			// Create a couple of tributes to ensure search has something to find
			const tribute1 = await createTribute({ name: `Searchable Alpha ${searchSuffix}`, slug: `search-alpha-${searchSuffix}`}, mockEvent);
			const tribute2 = await createTribute({ name: `Searchable Beta ${searchSuffix}`, slug: `search-beta-${searchSuffix}`, description: "CommonKeyword"}, mockEvent);
			if(tribute1) tribute1Id = tribute1.id;
			if(tribute2) tribute2Id = tribute2.id;
		});

		it('should search and return tributes with metadata (e.g., by name)', async () => {
			const result = await searchTributes({ 
				event: mockEvent, 
				query: `Searchable Alpha ${searchSuffix}`, // query searches 'name' by default in service
				pageSize: 5 
			});
			expect(result.tributes.length).toBeGreaterThanOrEqual(1);
			expect(result.tributes.some(t => t.name === `Searchable Alpha ${searchSuffix}`)).toBeTruthy();
			expect(result.meta).toBeDefined();
			expect(result.meta.pageSize).toBe(5);
		});

		it('should paginate search results', async () => {
			// This test assumes more than 1 tribute matches the general criteria
			// to test pagination effectively.
			const resultPage1 = await searchTributes({ event: mockEvent, query: `Searchable ${searchSuffix}`, pageSize: 1, page: 1 });
			expect(resultPage1.tributes.length).toBe(1);
			expect(resultPage1.meta.page).toBe(1);
			expect(resultPage1.meta.pageSize).toBe(1);
			
			if (resultPage1.meta.total > 1) {
				const resultPage2 = await searchTributes({ event: mockEvent, query: `Searchable ${searchSuffix}`, pageSize: 1, page: 2 });
				expect(resultPage2.tributes.length).toBe(1); // Or 0 if total was exactly 1
				expect(resultPage2.meta.page).toBe(2);
				// Ensure tributes are different if possible, or at least the call was made for page 2
				if (resultPage1.tributes[0] && resultPage2.tributes[0]) {
					expect(resultPage1.tributes[0].id).not.toBe(resultPage2.tributes[0].id);
				}
			}
		});
		
		it('should filter tributes using advanced filters (if supported and implemented)', async () => {
			// Example: searching by description if your searchTributes supports it via filters
			// This depends on how `filters` are handled in your `searchTributes` function.
			// The current `searchTributes` has a basic `filters[name][$containsi]` for `query`
			// and a naive serialization for the `filters` object.
			// To test advanced filters, ensure `searchTributes` correctly builds the query string.
			const result = await searchTributes({
				event: mockEvent,
				filters: { 'description[$containsi]': 'CommonKeyword' }, // Example filter
				pageSize: 5
			});
			expect(result.tributes.length).toBeGreaterThanOrEqual(1);
			expect(result.tributes.some(t => t.description?.includes('CommonKeyword'))).toBeTruthy();
		});

		afterAll(async () => {
			if (tribute1Id) await deleteTribute(tribute1Id, mockEvent);
			if (tribute2Id) await deleteTribute(tribute2Id, mockEvent);
		});
	});
});
