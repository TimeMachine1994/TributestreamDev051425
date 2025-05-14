/**
 * Backbone.js service for SvelteKit components
 *
 * Note: This file requires the backbone dependency.
 * Make sure to install it with:
 * npm install backbone underscore jwt-decode
 * npm install --save-dev @types/backbone @types/underscore @types/jwt-decode
 */

import Backbone from 'backbone';
import { get } from 'svelte/store';
import { authStore } from './auth-service';
import {
  PostModel,
  PageModel,
  TributeModel,
  PostsCollection,
  PagesCollection,
  TributesCollection
} from '$lib/models/wp-backbone';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize Backbone.js
 */
export function initializeBackbone(): void {
  // Skip initialization during SSR
  if (!isBrowser) return;
  
  console.log('Initializing Backbone.js...');
  
  // Completely replace Backbone.sync with our own implementation
  // This avoids using Backbone's internal ajax implementation
  Backbone.sync = function(method: string, model: any, options: any = {}) {
    console.log('Custom Backbone.sync called with method:', method);
    
    // Map Backbone's CRUD operations to HTTP methods
    const methodMap: Record<string, string> = {
      'create': 'POST',
      'update': 'PUT',
      'patch': 'PATCH',
      'delete': 'DELETE',
      'read': 'GET'
    };
    
    // Get the URL from the model or collection
    const url = options.url || (typeof model.url === 'function' ? model.url() : model.url);
    
    if (!url) {
      console.error('No URL specified for Backbone.sync');
      return Promise.reject(new Error('No URL specified'));
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    // Prepare request body
    let body = undefined;
    if (method !== 'read') {
      if (options.data) {
        body = JSON.stringify(options.data);
      } else if (model.toJSON) {
        body = JSON.stringify(model.toJSON());
      }
    }
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: methodMap[method] || 'GET',
      headers,
      body,
      credentials: 'include' // Include cookies in all requests
    };
    
    // Make the request
    return fetch(url, fetchOptions)
      .then(response => {
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          if (options.error) options.error(error);
          throw error;
        }
        return response.json();
      })
      .then(data => {
        if (options.success) options.success(data);
        return data;
      })
      .catch(error => {
        console.error('Backbone sync error:', error);
        throw error;
      });
  };
}

/**
 * Service for working with WordPress posts
 */
export const postService = {
  /**
   * Get a single post
   */
  getPost: async (id: number) => {
    // Return empty data during SSR
    if (!isBrowser) return {};
    
    const post = new PostModel({ id });
    await post.fetch();
    return post.toJSON();
  },
  
  /**
   * Get all posts
   */
  getPosts: async (params = {}) => {
    // Return empty array during SSR
    if (!isBrowser) return [];
    
    const posts = new PostsCollection();
    await posts.fetch({ data: params });
    return posts.toJSON();
  },
  
  /**
   * Create a new post
   */
  createPost: async (postData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    const post = new PostModel(postData);
    await post.save();
    return post.toJSON();
  },
  
  /**
   * Update an existing post
   */
  updatePost: async (id: number, postData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    const post = new PostModel({ id, ...postData });
    await post.save();
    return post.toJSON();
  },
  
  /**
   * Delete a post
   */
  deletePost: async (id: number) => {
    // Skip during SSR
    if (!isBrowser) return true;
    
    const post = new PostModel({ id });
    await post.destroy();
    return true;
  }
};

/**
 * Service for working with WordPress pages
 */
export const pageService = {
  /**
   * Get a single page
   */
  getPage: async (id: number) => {
    // Return empty data during SSR
    if (!isBrowser) return {};
    
    const page = new PageModel({ id });
    await page.fetch();
    return page.toJSON();
  },
  
  /**
   * Get all pages
   */
  getPages: async (params = {}) => {
    // Return empty array during SSR
    if (!isBrowser) return [];
    
    const pages = new PagesCollection();
    await pages.fetch({ data: params });
    return pages.toJSON();
  },
  
  /**
   * Create a new page
   */
  createPage: async (pageData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    const page = new PageModel(pageData);
    await page.save();
    return page.toJSON();
  },
  
  /**
   * Update an existing page
   */
  updatePage: async (id: number, pageData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    const page = new PageModel({ id, ...pageData });
    await page.save();
    return page.toJSON();
  },
  
  /**
   * Delete a page
   */
  deletePage: async (id: number) => {
    // Skip during SSR
    if (!isBrowser) return true;
    
    const page = new PageModel({ id });
    await page.destroy();
    return true;
  }
};

/**
 * Service for working with tributes
 */
export const tributeService = {
  /**
   * Get a single tribute
   */
  getTribute: async (id: number) => {
    // Return empty data during SSR
    if (!isBrowser) return {};
    
    try {
      console.log(`Fetching tribute with ID: ${id}`);
      
      // Make direct API call with cookies included
      const response = await fetch(`/api/tributes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching tribute:', errorData);
        throw new Error(errorData.message || `Failed to fetch tribute: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tribute data received:', data);
      return data;
    } catch (error) {
      console.error('Error in getTribute:', error);
      throw error;
    }
  },
  
  /**
   * Get a tribute by slug
   */
  getTributeBySlug: async (slug: string) => {
    // Return empty data during SSR
    if (!isBrowser) return {};
    
    // Use fetch directly since this is a custom endpoint
    const response = await fetch(`/api/tributes/by-slug/${slug}`, {
      credentials: 'include' // Include cookies in the request
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tribute by slug');
    }
    return await response.json();
  },
  /**
   * Get all tributes
   */
  getTributes: async (params = {}) => {
    // Return empty array during SSR
    if (!isBrowser) return { tributes: [] };
    
    try {
      // Use fetch directly to get the properly structured response
      const response = await fetch('/api/tributes', {
        credentials: 'include' // Include cookies in the request
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tributes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct API response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching tributes:', error);
      return { tributes: [] };
    }
  },
  
  /**
   * Create a new tribute
   */
  createTribute: async (tributeData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    try {
      const response = await fetch('/api/tributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(tributeData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create tribute: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating tribute:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing tribute
   */
  updateTribute: async (id: number, tributeData: any) => {
    // Skip during SSR
    if (!isBrowser) return {};
    
    try {
      const response = await fetch(`/api/tributes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(tributeData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating tribute:', error);
      throw error;
    }
  },
  
  /**
   * Delete a tribute
   */
  deleteTribute: async (id: number) => {
    // Skip during SSR
    if (!isBrowser) return true;
    
    try {
      const response = await fetch(`/api/tributes/${id}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete tribute: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting tribute:', error);
      throw error;
    }
  }
};