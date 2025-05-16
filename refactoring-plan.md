# TributeStream Refactoring Plan: SvelteKit 5 + Strapi Migration

This document outlines a comprehensive plan to refactor the TributeStream application to fully leverage SvelteKit 5 runes and Strapi backend integration. The plan is organized into phases with discrete, actionable steps.

## Phase 1: Environment Setup and Configuration

### 1.1. Update Dependencies
```bash
# Update SvelteKit and Svelte to version 5
npm install svelte@5 @sveltejs/kit@latest

# Install/update Strapi client
npm install @strapi/client@latest
```

### 1.2. Configure Strapi Client

- **Update Strapi Client Configuration**

```typescript
// src/lib/server/strapi/client.ts
import { strapi as createStrapiClient } from '@strapi/client';
import { env } from '$env/dynamic/private';

export const strapi = createStrapiClient({
  baseURL: `${env.STRAPI_API_URL}/api`,
  auth: {
    token: env.STRAPI_API_TOKEN
  }
});
```

### 1.3. Set Environment Variables

```
# .env file
STRAPI_API_URL=https://your-strapi-instance.com
STRAPI_API_TOKEN=your_api_token
```

## Phase 2: Type System Standardization

### 2.1. Define Core Type Interfaces

- **Update User Interface**

```typescript
// src/lib/server/types.ts
export interface User {
  id: string; // Standardize as string to avoid type coercion
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role?: {
    id: string;
    name: string;
    type: string;
  };
  // Additional fields...
}
```

- **Update Tribute Interface**

```typescript
// src/lib/server/types.ts
export interface Tribute {
  id?: string;
  loved_one_name: string;
  slug: string;
  user_id: string;
  phone_number?: string;
  custom_html?: string;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}
```

### 2.2. Create App Type Declarations

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: import('$lib/server/types').User | null;
      strapi: any;
    }
    
    interface PageState {
      showModal?: boolean;
      selected?: any;
    }
    
    interface Error {
      code?: string;
      message: string;
    }
  }
}

export {};
```

## Phase 3: Auth System Refactoring

### 3.1. Implement JWT Authentication

- **Create Authentication Utilities**

```typescript
// src/lib/server/utils/auth.ts
import { strapi } from '$lib/server/strapi/client';
import type { User } from '$lib/server/types';

export async function getUserFromJwt(token: string): Promise<User | null> {
  try {
    const response = await strapi.fetch('users/me?populate=role', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching user from JWT:', error);
    return null;
  }
}

export function setAuthCookies(cookies: any, token: string, user: User): void {
  // Set JWT token cookie (httpOnly for security)
  cookies.set('jwt', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  
  // Set user info cookie (not httpOnly so client JS can access)
  cookies.set('user', JSON.stringify({
    id: user.id,
    name: user.username,
    email: user.email
  }), {
    path: '/',
    httpOnly: false,
    sameSite: 'strict',
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}
```

### 3.2. Refactor Auth Store to Use Runes

```typescript
// src/lib/stores/auth-store.svelte.ts
import { browser } from '$app/environment';
import type { User } from '$lib/server/types';

// State variables
export let user = $state<User | null>(null);
export let isAuthenticated = $state(false);
export let isLoading = $state(false);
export let error = $state<string | null>(null);

// Derived state
export const isAdmin = $derived(user?.role?.name === 'admin');
export const isFuneralDirector = $derived(user?.role?.name === 'funeral-director');
export const isContributor = $derived(user?.role?.name === 'contributor');
export const isFamilyContact = $derived(user?.role?.name === 'family-contact');

/**
 * Login action
 */
export async function login(username: string, password: string): Promise<boolean> {
  try {
    isLoading = true;
    error = null;
    
    // Create a FormData object to submit to the server-side action
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // Submit the form to the server-side action
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // The server has set the cookies, now we need to update the client-side store
      // We'll check auth state to get the user info
      await checkAuth();
      return true;
    } else {
      // Handle error
      error = result.message || 'Login failed';
      return false;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error during login';
    return false;
  } finally {
    isLoading = false;
  }
}

/**
 * Logout action
 */
export async function logout(): Promise<void> {
  try {
    isLoading = true;
    
    // Call the server-side logout action to clear cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Update the state
    user = null;
    isAuthenticated = false;
  } catch (err) {
    console.error('Error during logout:', err);
  } finally {
    isLoading = false;
  }
}

/**
 * Check if the user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    isLoading = true;
    error = null;
    
    // Make a request to a protected endpoint to check auth status
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include' // Important: include cookies in the request
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        // Update the store with user data from the server
        user = data.user;
        isAuthenticated = true;
        return true;
      }
    }
    
    // If we get here, authentication failed
    user = null;
    isAuthenticated = false;
    return false;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error checking auth';
    user = null;
    isAuthenticated = false;
    return false;
  } finally {
    isLoading = false;
  }
}
```

## Phase 4: Tribute Management Refactoring

### 4.1. Create Strapi Tribute Service

```typescript
// src/lib/server/strapi/tribute.ts
import { strapi } from './client';
import type { Tribute } from '../types';

export async function createTribute(data: Omit<Tribute, 'id'>): Promise<Tribute> {
  const entry = await strapi.collection('tributes').create({
    data
  });
  return entry;
}

export async function getTributeById(id: string): Promise<Tribute | null> {
  try {
    const entry = await strapi.collection('tributes').findOne(id);
    return entry.data;
  } catch (error) {
    console.error(`Error fetching tribute ${id}:`, error);
    return null;
  }
}

export async function getTributeBySlug(slug: string): Promise<Tribute | null> {
  try {
    const { data } = await strapi.collection('tributes').find({
      filters: { slug },
      populate: ['user_id']
    });
    
    return data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching tribute by slug ${slug}:`, error);
    return null;
  }
}

export async function updateTribute(id: string, data: Partial<Tribute>): Promise<Tribute | null> {
  try {
    const entry = await strapi.collection('tributes').update(id, {
      data
    });
    return entry.data;
  } catch (error) {
    console.error(`Error updating tribute ${id}:`, error);
    return null;
  }
}

export async function deleteTribute(id: string): Promise<boolean> {
  try {
    await strapi.collection('tributes').delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting tribute ${id}:`, error);
    return false;
  }
}

export async function searchTributes(query: string, page: number = 1, pageSize: number = 10): Promise<{ 
  tributes: Tribute[]; 
  pagination: { page: number; pageSize: number; pageCount: number; total: number; 
}}> {
  try {
    const { data, meta } = await strapi.collection('tributes').find({
      filters: {
        $or: [
          { loved_one_name: { $containsi: query } },
          { custom_html: { $containsi: query } }
        ]
      },
      populate: ['user_id'],
      pagination: {
        page,
        pageSize
      },
      sort: ['created_at:desc']
    });
    
    return {
      tributes: data,
      pagination: meta.pagination
    };
  } catch (error) {
    console.error(`Error searching tributes:`, error);
    return {
      tributes: [],
      pagination: { page: 1, pageSize, pageCount: 0, total: 0 }
    };
  }
}
```

### 4.2. Implement Tribute Store with Runes

```typescript
// src/lib/stores/tribute-store.svelte.ts
import type { Tribute } from '$lib/server/types';

// State
export let currentTribute = $state<Tribute | null>(null);
export let tributes = $state<Tribute[]>([]);
export let isLoading = $state(false);
export let error = $state<string | null>(null);
export let currentPage = $state(1);
export let totalPages = $state(1);
export let totalItems = $state(0);

// Derived states
export const hasError = $derived(!!error);
export const isEmpty = $derived(tributes.length === 0);
export const isLastPage = $derived(currentPage >= totalPages);

// Methods
export async function fetchTribute(id: string): Promise<Tribute | null> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch(`/api/tributes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentTribute = data.tribute;
    return currentTribute;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch tribute';
    return null;
  } finally {
    isLoading = false;
  }
}

export async function fetchTributeBySlug(slug: string): Promise<Tribute | null> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch(`/api/tributes/by-slug/${slug}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tribute: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentTribute = data.tribute;
    return currentTribute;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch tribute';
    return null;
  } finally {
    isLoading = false;
  }
}

export async function searchTributes(query: string, page: number = 1): Promise<Tribute[]> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    tributes = data.tributes || [];
    currentPage = data.current_page || 1;
    totalPages = data.total_pages || 1;
    totalItems = data.total_items || 0;
    
    return tributes;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to search tributes';
    return [];
  } finally {
    isLoading = false;
  }
}

export async function createTribute(tributeData: Omit<Tribute, 'id'>): Promise<Tribute | null> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch('/api/tributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tributeData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create tribute: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentTribute = data.tribute;
    return currentTribute;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to create tribute';
    return null;
  } finally {
    isLoading = false;
  }
}

export async function updateTribute(id: string, tributeData: Partial<Tribute>): Promise<Tribute | null> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch(`/api/tributes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tributeData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update tribute: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentTribute = data.tribute;
    return currentTribute;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to update tribute';
    return null;
  } finally {
    isLoading = false;
  }
}

export async function deleteTribute(id: string): Promise<boolean> {
  try {
    isLoading = true;
    error = null;
    
    const response = await fetch(`/api/tributes/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete tribute: ${response.statusText}`);
    }
    
    return true;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to delete tribute';
    return false;
  } finally {
    isLoading = false;
  }
}

export function resetStore(): void {
  currentTribute = null;
  tributes = [];
  error = null;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
}
```

## Phase 5: API Route Implementation

### 5.1. Authentication API Routes

```typescript
// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { strapi } from '$lib/server/strapi/client';
import { setAuthCookies } from '$lib/server/utils/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { identifier, password } = body;
    
    const { jwt, user } = await strapi.fetch('auth/local', {
      method: 'POST',
      body: {
        identifier,
        password
      }
    });
    
    if (jwt && user) {
      setAuthCookies(cookies, jwt, user);
      
      return json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
    
    return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    
    return json(
      { success: false, message: 'Authentication failed' }, 
      { status: 500 }
    );
  }
};
```

```typescript
// src/routes/api/auth/check/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserFromJwt } from '$lib/server/utils/auth';

export const GET: RequestHandler = async ({ cookies }) => {
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    return json({ authenticated: false });
  }
  
  try {
    const user = await getUserFromJwt(jwt);
    
    if (user) {
      return json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
    
    return json({ authenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    return json({ authenticated: false });
  }
};
```

### 5.2. Tribute API Routes

```typescript
// src/routes/api/tributes/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  createTribute, 
  searchTributes 
} from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const searchQuery = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  
  try {
    const { tributes, pagination } = await searchTributes(searchQuery, page, pageSize);
    
    return json({
      tributes,
      current_page: pagination.page,
      total_pages: pagination.pageCount,
      total_items: pagination.total
    });
  } catch (error) {
    console.error('Error searching tributes:', error);
    return json(
      { error: 'Failed to search tributes' }, 
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    return json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }
  
  try {
    const user = await getUserFromJwt(jwt);
    
    if (!user) {
      return json(
        { error: 'Invalid authentication' }, 
        { status: 401 }
      );
    }
    
    const tributeData = await request.json();
    
    // Ensure user_id is set to the authenticated user
    tributeData.user_id = user.id;
    
    const tribute = await createTribute(tributeData);
    
    return json({ tribute });
  } catch (error) {
    console.error('Error creating tribute:', error);
    return json(
      { error: 'Failed to create tribute' }, 
      { status: 500 }
    );
  }
};
```

```typescript
// src/routes/api/tributes/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  getTributeById, 
  updateTribute, 
  deleteTribute 
} from '$lib/server/strapi/tribute';
import { getUserFromJwt } from '$lib/server/utils/auth';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const tribute = await getTributeById(params.id);
    
    if (!tribute) {
      return json(
        { error: 'Tribute not found' }, 
        { status: 404 }
      );
    }
    
    return json({ tribute });
  } catch (error) {
    console.error(`Error fetching tribute ${params.id}:`, error);
    return json(
      { error: 'Failed to fetch tribute' }, 
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    return json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }
  
  try {
    const user = await getUserFromJwt(jwt);
    
    if (!user) {
      return json(
        { error: 'Invalid authentication' }, 
        { status: 401 }
      );
    }
    
    // Get current tribute to check ownership
    const currentTribute = await getTributeById(params.id);
    
    if (!currentTribute) {
      return json(
        { error: 'Tribute not found' }, 
        { status: 404 }
      );
    }
    
    // Check if user owns the tribute or is an admin
    if (currentTribute.user_id !== user.id && user.role?.name !== 'admin') {
      return json(
        { error: 'You do not have permission to update this tribute' }, 
        { status: 403 }
      );
    }
    
    const tributeData = await request.json();
    
    // Disallow changing the user_id
    delete tributeData.user_id;
    
    const tribute = await updateTribute(params.id, tributeData);
    
    return json({ tribute });
  } catch (error) {
    console.error(`Error updating tribute ${params.id}:`, error);
    return json(
      { error: 'Failed to update tribute' }, 
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
  const jwt = cookies.get('jwt');
  
  if (!jwt) {
    return json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }
  
  try {
    const user = await getUserFromJwt(jwt);
    
    if (!user) {
      return json(
        { error: 'Invalid authentication' }, 
        { status: 401 }
      );
    }
    
    // Get current tribute to check ownership
    const currentTribute = await getTributeById(params.id);
    
    if (!currentTribute) {
      return json(
        { error: 'Tribute not found' }, 
        { status: 404 }
      );
    }
    
    // Check if user owns the tribute or is an admin
    if (currentTribute.user_id !== user.id && user.role?.name !== 'admin') {
      return json(
        { error: 'You do not have permission to delete this tribute' }, 
        { status: 403 }
      );
    }
    
    await deleteTribute(params.id);
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting tribute ${params.id}:`, error);
    return json(
      { error: 'Failed to delete tribute' }, 
      { status: 500 }
    );
  }
};
```

## Phase 6: Page Components Refactoring

### 6.1. Celebration of Life Page

```svelte
<!-- src/routes/celebration-of-life-for-[slug]/+page.svelte -->
<script lang="ts">
    // Svelte 5 runes-style props
    let { data } = $props();
    
    // Extract tribute from data
    let tribute = $derived(data.tribute);
    
    // Computed properties with runes
    let hasCustomHtml = $derived(tribute?.custom_html !== null && tribute?.custom_html !== undefined);
    let pageTitle = $derived(`Celebration of Life for ${tribute?.loved_one_name || 'Loading...'}`);
    
    $effect(() => {
        console.log('Tribute data loaded:', tribute);
    });
</script>

<!-- Hero Section -->
<main class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
    <!-- Hero with gradient overlay -->
    <section
        class="relative h-[60vh] flex items-center justify-center bg-cover bg-bottom"
        style="background-image: url('https://strapi-cdn.tributestream.com/assets/celebration-background.jpg')"
    >
        <div class="absolute inset-0 bg-gradient-to-b from-[#D5BA7F]/40 to-transparent z-10"></div>
        <div class="container mx-auto px-4 z-20 text-center">
            <h1 class="text-4xl md:text-6xl mb-4 text-white font-['Fanwood_Text'] italic">
                {pageTitle}
            </h1>
        </div>
    </section>

    <!-- Content Section -->
    {#if hasCustomHtml}
        <div class="custom-html-container py-16 px-4">
            {@html tribute.custom_html}
        </div>
    {:else}
        <section class="py-16 px-4">
            <div class="container mx-auto max-w-4xl">
                <div class="relative aspect-video bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <button class="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <!-- FAQ Cards -->
    <section class="py-16 px-4 bg-black-900">
        <div class="container mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- FAQ Cards content -->
                <!-- ... -->
            </div>
        </div>
    </section>
</main>
```

### 6.2. Dashboard Layout

```svelte
<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import * as authStore from '$lib/stores/auth-store.svelte';
  import Header from '$lib/components/dashboard/header.svelte';
  import Sidebar from '$lib/components/dashboard/sidebar.svelte';
  import Footer from '$lib/components/dashboard/footer.svelte';

  // Use runes-style reactivity
  let isCheckingAuth = $state(true);

  // Initialize and check authentication
  onMount(async () => {
    // Skip initialization during SSR
    if (browser) {
      isCheckingAuth = true;
      
      // Check if user is authenticated
      if (!authStore.isAuthenticated) {
        const isAuthenticated = await authStore.checkAuth();
        
        // If still not authenticated, redirect to login
        if (!isAuthenticated) {
          goto('/login?redirect=/dashboard');
        }
      }
      
      isCheckingAuth = false;
    }
  });
</script>

{#if isCheckingAuth}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
  </div>
{:else}
  <div class="dashboard-layout">
    <Header />
    
    <div class="dashboard-content">
      <Sidebar />
      
      <main class="main-content">
        <slot />
      </main>
    </div>
    
    <Footer />
  </div>
{/if}

<style>
  .dashboard-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .dashboard-content {
    display: flex;
    flex: 1;
    margin-top: 4rem; /* Space for header */
  }
  
  .main-content {
    flex: 1;
    padding: 2rem;
    margin-left: 250px; /* Width of sidebar */
    overflow-y: auto;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .main-content {
      margin-left: 60px; /* Width of collapsed sidebar */
      padding: 1rem;
    }
  }
</style>
```

### 6.3. Login Form

```svelte
<!-- src/lib/components/auth/login-form.svelte -->
<script lang="ts">
