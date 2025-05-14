import { setContext, getContext } from 'svelte';
import { saveTribute } from '$lib/utils/api-helpers';
import type { TributeData } from '$lib/utils/api-helpers';

// Define interface for a tribute
export interface Tribute {
  id?: number | string;
  title: string; // Loved one's name
  slug: string;
  description?: string;
  memorialDate?: string;
  memorialLocation?: string;
  custom_html?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow for additional properties
}

// Define interface for search results
export interface TributeSearchResults {
  tributes: Tribute[];
  total_pages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

// Unique symbol key for the context
const tributeStoreKey = Symbol('tributeStore');

export class TributePageStore {
  // Current tribute being viewed or edited
  currentTribute = $state<Partial<Tribute>>({
    title: '',
    slug: '',
    custom_html: null
  });

  // Search state
  searchResults = $state<TributeSearchResults>({
    tributes: [],
    total_pages: 1,
    currentPage: 1,
    isLoading: false,
    error: null
  });

  // Recently created/updated tributes (for caching)
  recentTributes = $state<Tribute[]>([]);

  // Current JWT token
  authToken = $state<string | null>(null);

  // Constructor initializes from localStorage if available
  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }

    // Automatic persistence with $effect
    $effect(() => {
      if (typeof window !== 'undefined') {
        this.saveToLocalStorage();
      }
    });
  }

  // Method to update current tribute
  updateCurrentTribute(tributeData: Partial<Tribute>) {
    this.currentTribute = { ...this.currentTribute, ...tributeData };
  }

  // Method to search tributes
  async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<void> {
    try {
      this.searchResults.isLoading = true;
      this.searchResults.error = null;

      const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.searchResults = {
        tributes: data.tributes || [],
        total_pages: data.total_pages || 1,
        currentPage: page,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error searching tributes:', error);
      this.searchResults = {
        ...this.searchResults,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Method to fetch a single tribute by ID
  async fetchTributeById(id: string | number): Promise<Tribute | null> {
    try {
      const response = await fetch(`/api/tributes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.updateCurrentTribute(data.tribute);
      return data.tribute;
    } catch (error) {
      console.error('Error fetching tribute:', error);
      return null;
    }
  }

  // Method to fetch a single tribute by slug
  async fetchTributeBySlug(slug: string): Promise<Tribute | null> {
    try {
      const response = await fetch(`/api/tributes/by-slug/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.tribute) {
        this.updateCurrentTribute(data.tribute);
        return data.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tribute by slug:', error);
      return null;
    }
  }

  // Method to create a new tribute
  async createTribute(tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      // Format the data according to the TributeData interface
      const formattedData: TributeData = {
        title: tributeData.title || '',
        slug: tributeData.slug || this.generateSlug(tributeData.title || ''),
        custom_html: tributeData.custom_html || null,
        user_name: tributeData.user_name || 'Anonymous',
        user_email: tributeData.user_email || 'anonymous@example.com',
        user_phone: tributeData.user_phone || '000-000-0000',
        ...tributeData
      };

      const result = await saveTribute(formattedData, this.authToken);
      
      if (result && result.tribute) {
        this.updateCurrentTribute(result.tribute);
        this.recentTributes = [...this.recentTributes, result.tribute];
        return result.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error creating tribute:', error);
      return null;
    }
  }

  // Method to update an existing tribute
  async updateTribute(id: string | number, tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      const response = await fetch(`/api/tributes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        },
        body: JSON.stringify({
          id,
          ...tributeData,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.tribute) {
        this.updateCurrentTribute(data.tribute);
        
        // Update in recent tributes cache
        this.recentTributes = this.recentTributes.map(tribute => 
          tribute.id === id ? { ...tribute, ...data.tribute } : tribute
        );
        
        return data.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error updating tribute:', error);
      return null;
    }
  }

  // Method to delete a tribute
  async deleteTribute(id: string | number): Promise<boolean> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      const response = await fetch(`/api/tributes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // Remove from recent tributes cache
        this.recentTributes = this.recentTributes.filter(tribute => tribute.id !== id);
        
        // Clear current tribute if it's the one being deleted
        if (this.currentTribute.id === id) {
          this.currentTribute = { title: '', slug: '', custom_html: null };
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting tribute:', error);
      return false;
    }
  }

  // Method to generate a slug from a title
  generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with a single one
      .trim();
    
    return `celebration-of-life-for-${baseSlug}`;
  }

  // Method to generate the tribute page URL
  generateTributeUrl(tribute?: Partial<Tribute>): string {
    const slug = tribute?.slug || this.currentTribute.slug;
    if (!slug) {
      return '';
    }
    
    // If slug already contains the prefix, return as is
    if (slug.startsWith('celebration-of-life-for-')) {
      return `/${slug}`;
    }
    
    return `/celebration-of-life-for-${slug}`;
  }

  // Method to set the auth token
  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Method to save to localStorage
  saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tributePageStore', JSON.stringify({
        currentTribute: this.currentTribute,
        recentTributes: this.recentTributes,
        authToken: this.authToken
      }));
    }
  }

  // Method to load from localStorage
  loadFromLocalStorage(): boolean {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('tributePageStore');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          this.currentTribute = data.currentTribute || { title: '', slug: '', custom_html: null };
          this.recentTributes = data.recentTributes || [];
          this.authToken = data.authToken || null;
          return true;
        } catch (e) {
          console.error('Failed to parse saved tribute data:', e);
        }
      }
    }
    return false;
  }

  // Method to reset the store
  reset() {
    this.currentTribute = { title: '', slug: '', custom_html: null };
    this.searchResults = {
      tributes: [],
      total_pages: 1,
      currentPage: 1,
      isLoading: false,
      error: null
    };
    // Intentionally not clearing the authToken or recentTributes for UX purposes
  }
}

export function setTributePageStoreContext() {
  const store = new TributePageStore();
  setContext(tributeStoreKey, store);
  return store;
}

export function getTributePageStoreContext(): TributePageStore {
  return getContext(tributeStoreKey);
}