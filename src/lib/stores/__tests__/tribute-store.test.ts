/**
 * Tests for tribute-store.svelte.ts
 * 
 * This file contains tests for the Tribute Store state machine.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TributeStore, TributeStoreStates } from '../tribute-store.svelte';
import { modelRegistry, ModelTypes } from '$lib/backbone/model-registry';
import type { Tribute } from '$lib/types/wp-models';

// Mock the model registry
vi.mock('$lib/backbone/model-registry', () => ({
  modelRegistry: {
    fetchModel: vi.fn(),
    saveModel: vi.fn(),
    deleteModel: vi.fn(),
    getModel: vi.fn(),
    clearCache: vi.fn(),
    getModelsOfType: vi.fn(),
    hasModel: vi.fn()
  },
  ModelTypes: {
    POST: 'post',
    PAGE: 'page',
    TRIBUTE: 'tribute',
    USER: 'user'
  }
}));

// Mock the validation functions
vi.mock('$lib/backbone/validation', () => {
  return {
    validateTribute: vi.fn(),
    validateModel: vi.fn(),
    validatePost: vi.fn(),
    validatePage: vi.fn(),
    validateUser: vi.fn(),
    formatValidationErrors: vi.fn()
  };
});

// Create a mock for the missing modules
vi.mock('$lib/backbone/ssr-collection', () => {
  return {
    createPaginatedCollection: vi.fn(),
    createSSRCollection: vi.fn(),
    fetchSSRCollection: vi.fn(),
    filterSSRCollection: vi.fn()
  };
});

// Import the mocked functions
import { validateTribute } from '$lib/backbone/validation';
import { createPaginatedCollection } from '$lib/backbone/ssr-collection';

// Mock fetch API
global.fetch = vi.fn();

describe('Tribute Store', () => {
  let store: TributeStore;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ tribute: { id: 1, loved_one_name: 'Test' } })
    });
    
    // Create a new store instance
    store = new TributeStore();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('Initial State', () => {
    it('should initialize with the correct state', () => {
      expect(store.state).toBe(TributeStoreStates.IDLE);
      expect(store.currentTribute).toEqual({
        loved_one_name: '',
        phone_number: '',
        custom_html: ''
      });
      expect(store.searchResults).toEqual({
        tributes: [],
        total_pages: 1,
        currentPage: 1
      });
      expect(store.error).toBeNull();
      expect(store.validationErrors).toBeNull();
    });
    
    it('should have the correct derived states', () => {
      expect(store.isLoading).toBe(false);
      expect(store.isSaving).toBe(false);
      expect(store.isDeleting).toBe(false);
      expect(store.hasError).toBe(false);
      expect(store.isSuccess).toBe(false);
    });
  });
  
  describe('fetchTribute', () => {
    it('should fetch a tribute by ID', async () => {
      // Mock the model registry fetchModel method
      (modelRegistry.fetchModel as any).mockResolvedValue({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Fetch the tribute
      const tribute = await store.fetchTribute(1);
      
      // Check that the model registry was called correctly
      expect(modelRegistry.fetchModel).toHaveBeenCalledWith(ModelTypes.TRIBUTE, 1);
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.currentTribute).toEqual({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      expect(store.error).toBeNull();
      
      // Check that the tribute was returned correctly
      expect(tribute).toEqual({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
    });
    
    it('should handle fetch errors', async () => {
      // Mock the model registry fetchModel method to throw an error
      (modelRegistry.fetchModel as any).mockRejectedValue(new Error('Fetch error'));
      
      // Fetch the tribute
      const tribute = await store.fetchTribute(1);
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Fetch error');
      
      // Check that the tribute was not returned
      expect(tribute).toBeNull();
    });
  });
  
  describe('fetchTributeBySlug', () => {
    it('should fetch a tribute by slug', async () => {
      // Fetch the tribute
      const tribute = await store.fetchTributeBySlug('test-slug');
      
      // Check that fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/tributes/by-slug/test-slug', {
        credentials: 'include'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.currentTribute).toEqual({ id: 1, loved_one_name: 'Test' });
      expect(store.error).toBeNull();
      
      // Check that the tribute was returned correctly
      expect(tribute).toEqual({ id: 1, loved_one_name: 'Test' });
    });
    
    it('should handle fetch errors', async () => {
      // Mock a failed fetch
      (global.fetch as any).mockRejectedValue(new Error('Fetch error'));
      
      // Fetch the tribute
      const tribute = await store.fetchTributeBySlug('test-slug');
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Fetch error');
      
      // Check that the tribute was not returned
      expect(tribute).toBeNull();
    });
  });
  
  describe('searchTributes', () => {
    it('should search for tributes', async () => {
      // Mock a successful search response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          tributes: [{ id: 1, loved_one_name: 'Test' }],
          total_pages: 2,
          currentPage: 1
        })
      });
      
      // Search for tributes
      const results = await store.searchTributes('test', 1, 10);
      
      // Check that fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/tributes?search=test&page=1&per_page=10', {
        credentials: 'include'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.searchResults).toEqual({
        tributes: [{ id: 1, loved_one_name: 'Test' }],
        total_pages: 2,
        currentPage: 1
      });
      expect(store.error).toBeNull();
      
      // Check that the results were returned correctly
      expect(results).toEqual({
        tributes: [{ id: 1, loved_one_name: 'Test' }],
        total_pages: 2,
        currentPage: 1
      });
    });
    
    it('should handle search errors', async () => {
      // Mock a failed search
      (global.fetch as any).mockRejectedValue(new Error('Search error'));
      
      // Search for tributes
      const results = await store.searchTributes('test');
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Search error');
      
      // Check that empty results were returned
      expect(results).toEqual({
        tributes: [],
        total_pages: 1,
        currentPage: 1
      });
    });
  });
  
  describe('getTributes', () => {
    it('should get all tributes', async () => {
      // Mock the createPaginatedCollection function
      const mockCollection = {
        toJSON: () => [{ id: 1, loved_one_name: 'Test' }]
      };
      
      // Use the mocked function
      (createPaginatedCollection as any).mockResolvedValue({
        collection: mockCollection,
        pagination: {
          page: 1,
          perPage: 10,
          totalItems: 20,
          totalPages: 2
        }
      });
      
      // Get all tributes
      const results = await store.getTributes(1, 10);
      
      // Check that createPaginatedCollection was called correctly
      expect(createPaginatedCollection).toHaveBeenCalledWith(
        expect.anything(),
        1,
        10
      );
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.searchResults).toEqual({
        tributes: [{ id: 1, loved_one_name: 'Test' }],
        total_pages: 2,
        currentPage: 1
      });
      expect(store.error).toBeNull();
      
      // Check that the results were returned correctly
      expect(results).toEqual({
        tributes: [{ id: 1, loved_one_name: 'Test' }],
        total_pages: 2,
        currentPage: 1
      });
    });
    
    it('should handle fetch errors', async () => {
      // Mock a failed fetch
      (createPaginatedCollection as any).mockRejectedValue(new Error('Fetch error'));
      
      // Get all tributes
      const results = await store.getTributes();
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Fetch error');
      
      // Check that empty results were returned
      expect(results).toEqual({
        tributes: [],
        total_pages: 1,
        currentPage: 1
      });
    });
  });
  
  describe('createTribute', () => {
    it('should create a new tribute', async () => {
      // Mock the validation function
      (validateTribute as any).mockReturnValue(null);
      
      // Mock the model registry saveModel method
      (modelRegistry.saveModel as any).mockResolvedValue({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Create a new tribute
      const tribute = await store.createTribute({
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Check that the validation function was called correctly
      expect(validateTribute).toHaveBeenCalledWith({
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Check that the model registry was called correctly
      expect(modelRegistry.saveModel).toHaveBeenCalledWith(ModelTypes.TRIBUTE, {
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.currentTribute).toEqual({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      expect(store.error).toBeNull();
      expect(store.validationErrors).toBeNull();
      
      // Check that the tribute was returned correctly
      expect(tribute).toEqual({
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
    });
    
    it('should handle validation errors', async () => {
      // Mock the validation function to return errors
      (validateTribute as any).mockReturnValue({
        loved_one_name: "Loved one's name is required"
      });
      
      // Create a new tribute
      const tribute = await store.createTribute({
        phone_number: '123-456-7890'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Validation failed');
      expect(store.validationErrors).toEqual({
        loved_one_name: "Loved one's name is required"
      });
      
      // Check that the tribute was not returned
      expect(tribute).toBeNull();
      
      // Check that the model registry was not called
      expect(modelRegistry.saveModel).not.toHaveBeenCalled();
    });
    
    it('should handle save errors', async () => {
      // Mock the validation function
      (validateTribute as any).mockReturnValue(null);
      
      // Mock the model registry saveModel method to throw an error
      (modelRegistry.saveModel as any).mockRejectedValue(new Error('Save error'));
      
      // Create a new tribute
      const tribute = await store.createTribute({
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Save error');
      
      // Check that the tribute was not returned
      expect(tribute).toBeNull();
    });
  });
  
  describe('updateTribute', () => {
    it('should update an existing tribute', async () => {
      // Set up the current tribute
      store.currentTribute = {
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      };
      
      // Mock the validation function
      (validateTribute as any).mockReturnValue(null);
      
      // Mock the model registry saveModel method
      (modelRegistry.saveModel as any).mockResolvedValue({
        id: 1,
        loved_one_name: 'Updated',
        phone_number: '123-456-7890'
      });
      
      // Update the tribute
      const tribute = await store.updateTribute(1, {
        loved_one_name: 'Updated'
      });
      
      // Check that the validation function was called correctly
      expect(validateTribute).toHaveBeenCalledWith({
        id: 1,
        loved_one_name: 'Updated',
        phone_number: '123-456-7890'
      });
      
      // Check that the model registry was called correctly
      expect(modelRegistry.saveModel).toHaveBeenCalledWith(ModelTypes.TRIBUTE, {
        id: 1,
        loved_one_name: 'Updated'
      });
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.currentTribute).toEqual({
        id: 1,
        loved_one_name: 'Updated',
        phone_number: '123-456-7890'
      });
      expect(store.error).toBeNull();
      expect(store.validationErrors).toBeNull();
      
      // Check that the tribute was returned correctly
      expect(tribute).toEqual({
        id: 1,
        loved_one_name: 'Updated',
        phone_number: '123-456-7890'
      });
    });
  });
  
  describe('deleteTribute', () => {
    it('should delete a tribute', async () => {
      // Set up the current tribute
      store.currentTribute = {
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      };
      
      // Mock the model registry deleteModel method
      (modelRegistry.deleteModel as any).mockResolvedValue(true);
      
      // Delete the tribute
      const result = await store.deleteTribute(1);
      
      // Check that the model registry was called correctly
      expect(modelRegistry.deleteModel).toHaveBeenCalledWith(ModelTypes.TRIBUTE, 1);
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.SUCCESS);
      expect(store.currentTribute).toEqual({
        loved_one_name: '',
        phone_number: '',
        custom_html: ''
      });
      expect(store.error).toBeNull();
      
      // Check that the result was returned correctly
      expect(result).toBe(true);
    });
    
    it('should handle delete errors', async () => {
      // Mock the model registry deleteModel method to throw an error
      (modelRegistry.deleteModel as any).mockRejectedValue(new Error('Delete error'));
      
      // Delete the tribute
      const result = await store.deleteTribute(1);
      
      // Check that the store state was updated correctly
      expect(store.state).toBe(TributeStoreStates.ERROR);
      expect(store.error).toBe('Delete error');
      
      // Check that the result was returned correctly
      expect(result).toBe(false);
    });
  });
  
  describe('reset', () => {
    it('should reset the store', () => {
      // Set up the store with some data
      store.state = TributeStoreStates.SUCCESS;
      store.currentTribute = {
        id: 1,
        loved_one_name: 'Test',
        phone_number: '123-456-7890'
      };
      store.error = 'Some error';
      store.validationErrors = { loved_one_name: 'Error' };
      
      // Reset the store
      store.reset();
      
      // Check that the store was reset correctly
      expect(store.state).toBe(TributeStoreStates.IDLE);
      expect(store.currentTribute).toEqual({
        loved_one_name: '',
        phone_number: '',
        custom_html: ''
      });
      expect(store.error).toBeNull();
      expect(store.validationErrors).toBeNull();
    });
  });
});