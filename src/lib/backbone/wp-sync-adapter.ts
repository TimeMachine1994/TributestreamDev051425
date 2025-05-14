/**
 * WordPress Sync Adapter for Backbone.js
 * 
 * This adapter customizes Backbone.sync to work with WordPress REST API
 * and SvelteKit's cookie-based authentication.
 */

import Backbone from 'backbone';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize the WordPress Sync Adapter
 * 
 * This function replaces Backbone.sync with a custom implementation
 * that works with WordPress REST API and cookie-based authentication.
 */
export function initializeWPSyncAdapter(): void {
  // Skip initialization during SSR
  if (!isBrowser) return;
  
  console.log('Initializing WordPress Sync Adapter...');
  
  // Replace Backbone.sync with our custom implementation
  Backbone.sync = function(method: string, model: any, options: any = {}): Promise<any> {
    console.log(`WP Sync Adapter: ${method} request to ${options.url || model.url}`);
    
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
      credentials: 'include' // Include cookies in all requests for authentication
    };
    
    // Add request interceptors
    if (options.beforeSend) {
      options.beforeSend(fetchOptions);
    }
    
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
        
        // Add response interceptors
        if (options.afterReceive) {
          return options.afterReceive(data);
        }
        
        return data;
      })
      .catch(error => {
        console.error('WordPress sync error:', error);
        if (options.error) options.error(error);
        throw error;
      });
  };
}

/**
 * Helper function to create a sync method for a specific model or collection
 * 
 * @param defaultOptions Default options to include in all sync requests
 * @returns A sync method that can be used by Backbone models and collections
 */
export function createWPSyncMethod(defaultOptions: any = {}): (method: string, model: any, options: any) => Promise<any> {
  return function(this: any, method: string, model: any, options: any = {}): Promise<any> {
    // Skip during SSR
    if (!isBrowser) {
      return Promise.resolve(method === 'read' ? (model.models ? [] : {}) : true);
    }
    
    // Merge default options with provided options
    const syncOptions = {
      ...defaultOptions,
      ...options
    };
    
    return Backbone.sync.call(this, method, model, syncOptions);
  };
}

/**
 * Helper function to create a sync method that works with WordPress REST API
 * and includes specific headers or parameters
 * 
 * @param headers Additional headers to include in all requests
 * @param params Additional query parameters to include in all requests
 * @returns A sync method that can be used by Backbone models and collections
 */
// Extended RequestInit interface to include url property
interface ExtendedRequestInit extends RequestInit {
  url?: string;
}

export function createWPRESTSync(headers: Record<string, string> = {}, params: Record<string, string> = {}): (method: string, model: any, options: any) => Promise<any> {
  return createWPSyncMethod({
    headers,
    beforeSend: (options: ExtendedRequestInit) => {
      // Add query parameters to URL for GET requests
      if (options.method === 'GET' && Object.keys(params).length > 0 && options.url) {
        const url = new URL(options.url);
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
        options.url = url.toString();
      }
    }
  });
}