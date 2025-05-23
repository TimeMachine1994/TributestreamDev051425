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
	StrapiTributeEntity, // Assuming this is the type for a single entity from Strapi
	StrapiTributeCollectionResponse,
	PaginationMeta
} from '$lib/types/tribute';
import { mapStrapiTributeToAppTribute } from '$lib/types/tribute';
import type { RequestEvent } from '@sveltejs/kit';

// Mock strapiFetch
const mockStrapiFetch = vi.fn();
vi.mock('./rest-api', () => ({
	strapiFetch: mockStrapiFetch
}));

// Mock mapStrapiTributeToAppTribute as it's a dependency from another module
// If we want to test its internal logic, it should have its own spec file.
// Here, we assume it works correctly or mock its behavior for tribute service tests.
vi.mock('$lib/types/tribute', async (importOriginal) => {
	const original = await importOriginal<typeof import('$lib/types/tribute')>();
	return {
		...original,
		mapStrapiTributeToAppTribute: vi.fn((entity) => {
			if (!entity) return null;
			// Simplified mock mapping for testing purposes
			return {
				id: String(entity.id),
				name: entity.attributes.name,
				slug: entity.attributes.slug,
				status: entity.attributes.publishedAt ? 'published' : 'draft', // Example logic
				// owner: entity.attributes.owner?.data ? { id: String(entity.attributes.owner.data.id) } : undefined,
			} as Tribute;
		})
	};
});


// Mock RequestEvent
const mockEvent = {} as RequestEvent;

describe('Strapi Tribute Service', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		// Reset the mock implementation of mapStrapiTributeToAppTribute if needed, or ensure it's fresh
		(mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockClear();
		// Default mock implementation for mapStrapiTributeToAppTribute for most tests
		(mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockImplementation((entity) => {
			if (!entity) return null;
			return {
				id: String(entity.id),
				name: entity.attributes.name,
				slug: entity.attributes.slug,
				status: entity.attributes.publishedAt ? 'published' : 'draft',
				description: entity.attributes.description,
				// owner: entity.attributes.owner?.data ? { id: String(entity.attributes.owner.data.id) } : undefined,
			} as Tribute;
		});
	});

	// --- createTribute ---
	describe('createTribute', () => {
		const tributeInput: TributeInputAttributes = {
			name: 'New Tribute',
			slug: 'new-tribute',
			description: 'A lovely new tribute.'
		};
		const mockStrapiEntity: StrapiTributeEntity = {
			id: 1,
			attributes: {
				name: 'New Tribute',
				slug: 'new-tribute',
				description: 'A lovely new tribute.',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				publishedAt: null, // Example: starts as draft
			}
		};

		it('should create and return a tribute', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiEntity });
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce({
			// 	id: '1',
			// 	name: 'New Tribute',
			// 	slug: 'new-tribute',
			// 	status: 'draft',
			// 	description: 'A lovely new tribute.'
			// } as Tribute);


			const tribute = await createTribute(tributeInput, mockEvent);

			expect(tribute).not.toBeNull();
			expect(tribute.name).toBe('New Tribute');
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				'/tributes',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ data: tributeInput })
				}),
				mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledWith(mockStrapiEntity);
		});

		it('should throw an error if mapping fails', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiEntity });
			(mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);

			await expect(createTribute(tributeInput, mockEvent)).rejects.toThrow(
				'Failed to map created tribute from Strapi response'
			);
		});
	});

	// --- getTributeById ---
	describe('getTributeById', () => {
		const tributeId = '123';
		const mockStrapiEntity: StrapiTributeEntity = {
			id: 123,
			attributes: {
				name: 'Test Tribute',
				slug: 'test-tribute',
				description: 'Description',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				publishedAt: new Date().toISOString(),
			}
		};

		it('should return a tribute when ID is valid', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiEntity });
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce({
			// 	id: tributeId,
			// 	name: 'Test Tribute',
			// 	slug: 'test-tribute',
			// 	status: 'published'
			// } as Tribute);

			const tribute = await getTributeById(tributeId, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.id).toBe(tributeId);
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				`/tributes/${tributeId}?populate=owner`, { method: 'GET' }, mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledWith(mockStrapiEntity);
		});

		it('should return null if tribute ID is invalid/empty', async () => {
			const tribute = await getTributeById('', mockEvent);
			expect(tribute).toBeNull();
			expect(mockStrapiFetch).not.toHaveBeenCalled();
		});

		it('should return null if tribute not found (404)', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 404, message: 'Not Found' });
			const tribute = await getTributeById('unknown-id', mockEvent);
			expect(tribute).toBeNull();
		});

		it('should throw for other errors', async () => {
			mockStrapiFetch.mockRejectedValue({ status: 500, message: 'Server Error' });
			await expect(getTributeById('123', mockEvent)).rejects.toThrow('Server Error');
		});
	});

	// --- getTributeBySlug ---
	describe('getTributeBySlug', () => {
		const slug = 'test-tribute';
		const mockStrapiEntity: StrapiTributeEntity = {
			id: 1,
			attributes: {
				name: 'Test Tribute',
				slug: 'test-tribute',
				description: 'Description',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				publishedAt: new Date().toISOString(),
			}
		};

		it('should return a tribute when slug is valid', async () => {
			const mockResponse: StrapiTributeCollectionResponse = {
				data: [mockStrapiEntity],
				meta: { pagination: { page: 1, pageSize: 1, pageCount: 1, total: 1 } }
			};
			mockStrapiFetch.mockResolvedValue(mockResponse);
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce({
			// 	id: '1',
			// 	name: 'Test Tribute',
			// 	slug: 'test-tribute',
			// 	status: 'published'
			// } as Tribute);

			const tribute = await getTributeBySlug(slug, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.slug).toBe(slug);
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				expect.stringContaining(`/tributes?filters[slug][$eq]=${slug}`), { method: 'GET' }, mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledWith(mockStrapiEntity);
		});

		it('should return null if slug is invalid/empty', async () => {
			const tribute = await getTributeBySlug('', mockEvent);
			expect(tribute).toBeNull();
			expect(mockStrapiFetch).not.toHaveBeenCalled();
		});

		it('should return null if no tribute found for slug', async () => {
			const mockResponse: StrapiTributeCollectionResponse = {
				data: [],
				meta: { pagination: { page: 1, pageSize: 1, pageCount: 0, total: 0 } }
			};
			mockStrapiFetch.mockResolvedValue(mockResponse);
			const tribute = await getTributeBySlug('unknown-slug', mockEvent);
			expect(tribute).toBeNull();
		});
	});

	// --- updateTribute ---
	describe('updateTribute', () => {
		const tributeId = '1';
		const tributeUpdateData: TributeInputAttributes = { name: 'Updated Name' };
		const mockStrapiEntity: StrapiTributeEntity = {
			id: 1,
			attributes: {
				name: 'Updated Name',
				slug: 'test-tribute', // Assuming slug doesn't change or is part of response
				description: 'Description',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				publishedAt: new Date().toISOString(),
			}
		};

		it('should update and return the tribute', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiEntity });
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce({
			// 	id: '1',
			// 	name: 'Updated Name',
			// 	slug: 'test-tribute',
			// 	status: 'published'
			// } as Tribute);

			const tribute = await updateTribute(tributeId, tributeUpdateData, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.name).toBe('Updated Name');
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				`/tributes/${tributeId}`,
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify({ data: tributeUpdateData })
				}),
				mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledWith(mockStrapiEntity);
		});
	});

	// --- deleteTribute ---
	describe('deleteTribute', () => {
		const tributeId = '1';
		const mockStrapiEntity: StrapiTributeEntity = {
			id: 1,
			attributes: {
				name: 'Deleted Tribute',
				slug: 'deleted-tribute',
				description: 'Description',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				publishedAt: new Date().toISOString(),
			}
		};
		it('should delete and return the tribute', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockStrapiEntity });
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>).mockReturnValueOnce({
			// 	id: '1',
			// 	name: 'Deleted Tribute',
			// 	slug: 'deleted-tribute',
			// 	status: 'published'
			// } as Tribute);

			const tribute = await deleteTribute(tributeId, mockEvent);
			expect(tribute).not.toBeNull();
			expect(tribute?.id).toBe(tributeId);
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				`/tributes/${tributeId}`, { method: 'DELETE' }, mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledWith(mockStrapiEntity);
		});
	});

	// --- searchTributes ---
	describe('searchTributes', () => {
		const mockEntities: StrapiTributeEntity[] = [
			{ id: 1, attributes: { name: 'Alpha Tribute', slug: 'alpha', createdAt: '', updatedAt: '', publishedAt: '' } },
			{ id: 2, attributes: { name: 'Beta Tribute', slug: 'beta', createdAt: '', updatedAt: '', publishedAt: '' } },
		];
		const mockPagination: PaginationMeta = { page: 1, pageSize: 2, pageCount: 1, total: 2 };

		it('should search and return tributes with metadata', async () => {
			mockStrapiFetch.mockResolvedValue({ data: mockEntities, meta: { pagination: mockPagination } });
			// (mapStrapiTributeToAppTribute as ReturnType<typeof vi.fn>)
			// 	.mockImplementationOnce(() => ({ id: '1', name: 'Alpha Tribute', slug: 'alpha', status: 'draft' } as Tribute))
			// 	.mockImplementationOnce(() => ({ id: '2', name: 'Beta Tribute', slug: 'beta', status: 'draft' } as Tribute));

			const result = await searchTributes({ event: mockEvent, pageSize: 2 });
			expect(result.tributes.length).toBe(2);
			expect(result.tributes[0].name).toBe('Alpha Tribute');
			expect(result.meta.total).toBe(2);
			expect(mockStrapiFetch).toHaveBeenCalledWith(
				expect.stringContaining('/tributes?pagination[page]=1&pagination[pageSize]=2'),
				{ method: 'GET' },
				mockEvent
			);
			expect(mapStrapiTributeToAppTribute).toHaveBeenCalledTimes(2);
		});
	});
});
