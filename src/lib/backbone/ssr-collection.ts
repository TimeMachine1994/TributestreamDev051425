/**
 * SSR-Compatible Collections for Backbone.js
 * 
 * This module provides factory functions for creating collections
 * that work in both browser and server environments.
 */

import type { WPEntity } from '$lib/types/wp-models';
import { WPCollection } from '$lib/models/wp-backbone';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Factory function to create an SSR-compatible collection
 * 
 * This function returns a collection that works in both browser and server environments.
 * During SSR, it returns a pre-populated collection with the provided data.
 * In the browser, it returns a normal Backbone collection that can fetch data from the API.
 * 
 * @param CollectionClass The Backbone collection class to use
 * @param initialData Initial data to populate the collection with
 * @returns A collection that works in both browser and server environments
 */
export function createSSRCollection<T extends WPEntity>(
  CollectionClass: any,
  initialData: T[] = []
): any {
  console.log(`[DEBUG] createSSRCollection called with CollectionClass:`, CollectionClass?.name || 'Unknown');
  console.log(`[DEBUG] createSSRCollection initialData:`, initialData);
  console.log(`[DEBUG] createSSRCollection isBrowser:`, isBrowser);
  
  // If we're in the browser, return a normal Backbone collection
  if (isBrowser) {
    console.log(`[DEBUG] createSSRCollection: In browser, creating real collection`);
    const collection = new CollectionClass();
    if (initialData.length > 0) {
      collection.reset(initialData);
    }
    console.log(`[DEBUG] createSSRCollection: Returning browser collection:`, collection);
    return collection;
  }
  
  // If we're in SSR, return a pre-populated collection
  console.log(`[DEBUG] createSSRCollection: In SSR, creating mock collection`);
  // Create a proper SSR collection with all required methods
  const ssrCollection = {
    // Store models as an array of data objects
    models: initialData.map(model => ({
      attributes: model,
      id: model.id,
      get: (attr: string) => model[attr as keyof T],
      set: (attrs: Record<string, any> | string, value?: any) => {
        if (typeof attrs === 'string') {
          (model as any)[attrs] = value;
        } else {
          Object.assign(model, attrs);
        }
        return model;
      },
      toJSON: () => ({ ...model })
    })),
    
    // Collection methods
    toJSON: function() {
      console.log(`[DEBUG] SSR Collection toJSON called, returning models:`, initialData);
      return initialData;
    },
    
    fetch: () => Promise.resolve({ models: initialData }),
    
    reset: function(models: T[]) {
      initialData = models;
      this.models = models.map(model => ({
        attributes: model,
        id: model.id,
        get: (attr: string) => model[attr as keyof T],
        set: (attrs: Record<string, any> | string, value?: any) => {
          if (typeof attrs === 'string') {
            (model as any)[attrs] = value;
          } else {
            Object.assign(model, attrs);
          }
          return model;
        },
        toJSON: () => ({ ...model })
      }));
      return this;
    },
    
    add: function(model: T) {
      initialData.push(model);
      this.models.push({
        attributes: model,
        id: model.id,
        get: (attr: string) => model[attr as keyof T],
        set: (attrs: Record<string, any> | string, value?: any) => {
          if (typeof attrs === 'string') {
            (model as any)[attrs] = value;
          } else {
            Object.assign(model, attrs);
          }
          return model;
        },
        toJSON: () => ({ ...model })
      });
      return this;
    },
    
    remove: function(model: T) {
      const id = typeof model === 'object' ? model.id : model;
      initialData = initialData.filter(m => m.id !== id);
      this.models = this.models.filter(m => m.id !== id);
      return this;
    },
    
    get: function(id: number | string) {
      return this.models.find(m => m.id === id);
    },
    
    filter: function(predicate: (model: any) => boolean) {
      return this.models.filter(predicate);
    },
    
    map: function(mapper: (model: any) => any) {
      return this.models.map(mapper);
    },
    
    forEach: function(callback: (model: any) => void) {
      this.models.forEach(callback);
      return this;
    },
    
    at: function(index: number) {
      return this.models[index];
    },
    
    get length() {
      return this.models.length;
    }
  };
  
  console.log(`[DEBUG] createSSRCollection: Returning SSR collection:`, ssrCollection);
  return ssrCollection;
}

/**
 * Helper function to fetch a collection with SSR support
 * 
 * This function fetches a collection from the API and returns it.
 * During SSR, it returns a pre-populated collection with the provided data.
 * 
 * @param CollectionClass The Backbone collection class to use
 * @param fetchOptions Options to pass to the fetch method
 * @param initialData Initial data to populate the collection with
 * @returns A promise that resolves to the fetched collection
 */
export async function fetchSSRCollection<T extends WPEntity>(
  CollectionClass: any,
  fetchOptions: any = {},
  initialData: T[] = []
): Promise<any> {
  const collection = createSSRCollection<T>(CollectionClass, initialData);
  
  // If we're in the browser, fetch the collection from the API
  if (isBrowser) {
    try {
      await collection.fetch(fetchOptions);
    } catch (error) {
      console.error('Error fetching collection:', error);
    }
  }
  
  return collection;
}

/**
 * Helper function to filter a collection with SSR support
 * 
 * This function filters a collection based on the provided predicate.
 * During SSR, it filters the pre-populated collection.
 * In the browser, it filters the collection after fetching it from the API.
 * 
 * @param CollectionClass The Backbone collection class to use
 * @param predicate A function that returns true for items to include
 * @param fetchOptions Options to pass to the fetch method
 * @param initialData Initial data to populate the collection with
 * @returns A promise that resolves to the filtered collection items
 */
export async function filterSSRCollection<T extends WPEntity>(
  CollectionClass: any,
  predicate: (model: T) => boolean,
  fetchOptions: any = {},
  initialData: T[] = []
): Promise<T[]> {
  const collection = await fetchSSRCollection<T>(CollectionClass, fetchOptions, initialData);
  
  if (isBrowser) {
    return collection.filter(predicate).map((model: any) => model.toJSON());
  }
  
  return collection.filter(predicate);
}

/**
 * Helper function to create a paginated collection with SSR support
 * 
 * This function creates a collection that supports pagination.
 * 
 * @param CollectionClass The Backbone collection class to use
 * @param page The page number to fetch
 * @param perPage The number of items per page
 * @param totalItems The total number of items (for SSR)
 * @param initialData Initial data to populate the collection with
 * @returns A promise that resolves to the paginated collection
 */
export async function createPaginatedCollection<T extends WPEntity>(
  CollectionClass: any,
  page: number = 1,
  perPage: number = 10,
  totalItems: number = 0,
  initialData: T[] = []
): Promise<{
  collection: any;
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  }
}> {
  // Calculate pagination info
  const totalPages = Math.ceil(totalItems / perPage);
  
  // Create the collection
  const collection = await fetchSSRCollection<T>(
    CollectionClass,
    {
      data: {
        page,
        per_page: perPage
      }
    },
    initialData
  );
  
  return {
    collection,
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages
    }
  };
}