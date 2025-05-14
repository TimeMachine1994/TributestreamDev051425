/**
 * Tribute Store - State Machine for Tribute models
 * 
 * This module provides a state machine for managing Tribute models.
 * It uses Svelte 5 runes for reactivity and integrates with Backbone models.
 */

import { setContext, getContext } from 'svelte';
import type { Tribute } from '$lib/types/wp-models';
import { modelRegistry, ModelTypes } from '$lib/backbone/model-registry';
import { validateTribute } from '$lib/backbone/validation';
import { TributesCollection } from '$lib/models/wp-backbone';
import { createPaginatedCollection } from '$lib/backbone/ssr-collection';

/**
 * Define the possible states for the tribute store
 */
export const TributeStoreStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  SAVING: 'saving',
  DELETING: 'deleting',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

export type TributeStoreState = typeof TributeStoreStates[keyof typeof TributeStoreStates];

/**
 * Define the interface for tribute search results
 */
export interface TributeSearchResults {
  tributes: Tribute[];
  total_pages: number;
  currentPage: number;
}

/**
 * Unique symbol key for the context
 */
const tributeStoreKey = Symbol('tributeStore');

/**
 * Tribute Store - State Machine for Tribute models
 * 
 * This class provides a state machine for managing Tribute models.
 * It uses Svelte 5 runes for reactivity and integrates with Backbone models.
 */
export class TributeStore {
  // State machine state
  state = $state<TributeStoreState>(TributeStoreStates.IDLE);
  
  // Current tribute being viewed or edited
  currentTribute = $state<Partial<Tribute>>({
    loved_one_name: '',
    phone_number: '',
    custom_html: ''
  });
  
  // Search results
  searchResults = $state<TributeSearchResults>({
    tributes: [],
    total_pages: 1,
    currentPage: 1
  });
  
  // Error message
  error = $state<string | null>(null);
  
  // Validation errors
  validationErrors = $state<Record<string, string> | null>(null);
  
  // Derived state for loading status
  isLoading = $derived(this.state === TributeStoreStates.LOADING);
  
  // Derived state for saving status
  isSaving = $derived(this.state === TributeStoreStates.SAVING);
  
  // Derived state for deleting status
  isDeleting = $derived(this.state === TributeStoreStates.DELETING);
  
  // Derived state for error status
  hasError = $derived(this.state === TributeStoreStates.ERROR);
  
  // Derived state for success status
  isSuccess = $derived(this.state === TributeStoreStates.SUCCESS);
  
  /**
   * Constructor
   */
  constructor() {
    // Set up effects for state transitions
    $effect(() => {
      if (this.state === TributeStoreStates.SUCCESS || this.state === TributeStoreStates.ERROR) {
        // Reset state after 3 seconds
        const timeout = setTimeout(() => {
          this.state = TributeStoreStates.IDLE;
        }, 3000);
        
        // Clean up the timeout when the effect is re-run
        return () => clearTimeout(timeout);
      }
    });
  }
  
  /**
   * Fetch a tribute by ID
   * 
   * @param id The ID of the tribute to fetch
   * @returns A promise that resolves to the fetched tribute
   */
  async fetchTribute(id: number | string): Promise<Tribute | null> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const tribute = await modelRegistry.fetchModel<Tribute>(ModelTypes.TRIBUTE, numericId);
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tribute';
      return null;
    }
  }
  
  /**
   * Fetch a tribute by slug
   * 
   * @param slug The slug of the tribute to fetch
   * @returns A promise that resolves to the fetched tribute
   */
  async fetchTributeBySlug(slug: string): Promise<Tribute | null> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      // Use fetch directly since this is a custom endpoint
      const response = await fetch(`/api/tributes/by-slug/${slug}`, {
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.tribute) {
        this.currentTribute = data.tribute;
        this.state = TributeStoreStates.SUCCESS;
        return data.tribute;
      }
      
      throw new Error('Tribute not found');
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tribute';
      return null;
    }
  }
  
  /**
   * Search for tributes
   * 
   * @param query The search query
   * @param page The page number
   * @param perPage The number of items per page
   * @returns A promise that resolves to the search results
   */
  async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<TributeSearchResults> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const results: TributeSearchResults = {
        tributes: data.tributes || [],
        total_pages: data.total_pages || 1,
        currentPage: page
      };
      
      this.searchResults = results;
      this.state = TributeStoreStates.SUCCESS;
      
      return results;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to search tributes';
      
      return {
        tributes: [],
        total_pages: 1,
        currentPage: 1
      };
    }
  }
  
  /**
   * Get all tributes
   * 
   * @param page The page number
   * @param perPage The number of items per page
   * @returns A promise that resolves to the paginated tributes
   */
  async getTributes(page: number = 1, perPage: number = 10): Promise<TributeSearchResults> {
    try {
      this.state = TributeStoreStates.LOADING;
      this.error = null;
      
      const { collection, pagination } = await createPaginatedCollection<Tribute>(
        TributesCollection,
        page,
        perPage
      );
      
      const tributes = collection.toJSON();
      
      const results: TributeSearchResults = {
        tributes,
        total_pages: pagination.totalPages,
        currentPage: pagination.page
      };
      
      this.searchResults = results;
      this.state = TributeStoreStates.SUCCESS;
      
      return results;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to fetch tributes';
      
      return {
        tributes: [],
        total_pages: 1,
        currentPage: 1
      };
    }
  }
  
  /**
   * Create a new tribute
   * 
   * @param tributeData The tribute data to create
   * @returns A promise that resolves to the created tribute
   */
  async createTribute(tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      // Validate the tribute data
      const validationErrors = validateTribute(tributeData);
      if (validationErrors) {
        this.validationErrors = validationErrors;
        this.state = TributeStoreStates.ERROR;
        this.error = 'Validation failed';
        return null;
      }
      
      this.state = TributeStoreStates.SAVING;
      this.error = null;
      this.validationErrors = null;
      
      const tribute = await modelRegistry.saveModel<Tribute>(ModelTypes.TRIBUTE, tributeData);
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to create tribute';
      return null;
    }
  }
  
  /**
   * Update an existing tribute
   * 
   * @param id The ID of the tribute to update
   * @param tributeData The tribute data to update
   * @returns A promise that resolves to the updated tribute
   */
  async updateTribute(id: number | string, tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      // Validate the tribute data
      const validationErrors = validateTribute({ ...this.currentTribute, ...tributeData });
      if (validationErrors) {
        this.validationErrors = validationErrors;
        this.state = TributeStoreStates.ERROR;
        this.error = 'Validation failed';
        return null;
      }
      
      this.state = TributeStoreStates.SAVING;
      this.error = null;
      this.validationErrors = null;
      
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const tribute = await modelRegistry.saveModel<Tribute>(ModelTypes.TRIBUTE, {
        id: numericId,
        ...tributeData
      });
      
      this.currentTribute = tribute;
      this.state = TributeStoreStates.SUCCESS;
      
      return tribute;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to update tribute';
      return null;
    }
  }
  
  /**
   * Delete a tribute
   * 
   * @param id The ID of the tribute to delete
   * @returns A promise that resolves to true if the tribute was deleted
   */
  async deleteTribute(id: number | string): Promise<boolean> {
    try {
      this.state = TributeStoreStates.DELETING;
      this.error = null;
      
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      await modelRegistry.deleteModel(ModelTypes.TRIBUTE, numericId);
      
      // Clear current tribute if it's the one being deleted
      if (this.currentTribute.id === id) {
        this.currentTribute = {
          loved_one_name: '',
          phone_number: '',
          custom_html: ''
        };
      }
      
      this.state = TributeStoreStates.SUCCESS;
      
      return true;
    } catch (error) {
      this.state = TributeStoreStates.ERROR;
      this.error = error instanceof Error ? error.message : 'Failed to delete tribute';
      return false;
    }
  }
  
  /**
   * Reset the store
   */
  reset(): void {
    this.state = TributeStoreStates.IDLE;
    this.currentTribute = {
      loved_one_name: '',
      phone_number: '',
      custom_html: ''
    };
    this.error = null;
    this.validationErrors = null;
  }
}

/**
 * Set the tribute store in the context
 * 
 * @returns The tribute store instance
 */
export function setTributeStoreContext(): TributeStore {
  const store = new TributeStore();
  setContext(tributeStoreKey, store);
  return store;
}

/**
 * Get the tribute store from the context
 * 
 * @returns The tribute store instance
 */
export function getTributeStoreContext(): TributeStore {
  return getContext<TributeStore>(tributeStoreKey);
}