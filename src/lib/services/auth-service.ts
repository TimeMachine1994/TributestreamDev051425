/**
 * Authentication service for WordPress JWT
 * Uses cookies as the single source of truth for authentication state
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/utils/cookie-auth';

/**
 * Interface for the auth store state
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Create the auth store
 */
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false
  });
  
  return {
    subscribe,
    
    /**
     * Login action
     */
    login: async (username: string, password: string): Promise<boolean> => {
      try {
        // Create a FormData object to submit to the server-side action
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        // Submit the form to the server-side action
        const response = await fetch('/my-portal?/login', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.type === 'success') {
          // The server has set the cookies, now we need to update the client-side store
          // We'll check auth state to get the user info
          const success = await authStore.checkAuth();
          return success;
        } else {
          // Handle error
          console.error('Login failed:', result.message);
          return false;
        }
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    
    /**
     * Logout action
     */
    logout: async (): Promise<void> => {
      // Call the server-side logout action to clear cookies
      try {
        await fetch('/my-portal?/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
      
      // Update the store
      set({
        user: null,
        isAuthenticated: false
      });
    },
    
    /**
     * Check if the user is authenticated
     */
    checkAuth: async (): Promise<boolean> => {
      if (!browser) return false;
      
      try {
        // Make a request to a protected endpoint to check auth status
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include' // Important: include cookies in the request
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            // Update the store with user data from the server
            update(state => ({
              ...state,
              user: data.user,
              isAuthenticated: true
            }));
            
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
      
      // If we get here, authentication failed
      update(state => ({
        ...state,
        user: null,
        isAuthenticated: false
      }));
      
      return false;
    }
  };
}

export const authStore = createAuthStore();