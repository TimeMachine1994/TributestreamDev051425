# Login → My Portal Implementation Plan

This implementation plan provides a structured approach for developing the login-to-portal flow in our SvelteKit application, based on the documentation and existing code. Each step is designed to be clear and detailed enough for a junior programmer to follow.

## 1. Authentication Utilities Setup

1. **JWT Handling Configuration**
   - Implement JWT verification in `src/lib/utils/jwt.ts`:
     ```typescript
     import { jwtVerify, errors } from 'jose';
     import { env } from '$env/dynamic/private';
     import type { RequestEvent } from '@sveltejs/kit';
     import { getStrapiClient } from '$lib/server/strapi/client';
     
     export class TokenExpiredError extends Error {
       constructor(message: string) {
         super(message);
         this.name = 'TokenExpiredError';
       }
     }
     
     export async function getUserFromToken(token: string, event: RequestEvent) {
       try {
         const rawSecret = env.STRAPI_JWT_SECRET;
         if (!rawSecret) throw new Error('Missing STRAPI_JWT_SECRET');
         
         const secret = new TextEncoder().encode(rawSecret);
         const { payload } = await jwtVerify(token, secret);
         
         // Extract user ID and fetch full user record from Strapi
         const userId = (payload as any).id;
         const strapi = getStrapiClient(event);
         const fullUserResponse = await strapi.collection('users').findOne(userId, {
           populate: ['role']
         });
         
         return fullUserResponse;
       } catch (err) {
         if (err instanceof errors.JWTExpired) {
           throw new TokenExpiredError(err.message);
         }
         return null;
       }
     }
     
     export function extractTokenFromCookie(cookieString: string) {
       return cookieString?.match(/jwt=([^;]+)/)?.[1] || null;
     }
     ```

2. **Authentication Helper Functions**
   - Create utility functions in `src/lib/utils/auth.ts`:
     ```typescript
     import { getUserFromToken as _getUserFromJwt } from '$lib/utils/jwt';
     import { serialize } from 'cookie';
     import type { RequestEvent } from '@sveltejs/kit';
     
     export async function getUserFromJwt(token: string, event: RequestEvent) {
       return _getUserFromJwt(token, event);
     }
     
     export function setAuthCookies(jwt: string, maxAgeSeconds = 604800) {
       const options = {
         httpOnly: true,
         path: '/',
         sameSite: 'lax' as const,
         secure: true,
         maxAge: maxAgeSeconds
       };
       
       return [
         serialize('jwt', jwt, options),
         serialize('jwt_expires', String(Date.now() + maxAgeSeconds * 1000), {
           ...options,
           httpOnly: false
         })
       ];
     }
     ```

## 2. Strapi Client Configuration

1. **API Client Implementation**
   - Set up the Strapi client wrapper in `src/lib/server/strapi/client.ts`:
     ```typescript
     import { strapi as createStrapiClient } from '@strapi/client';
     import { env } from '$env/dynamic/private';
     import type { RequestEvent } from '@sveltejs/kit';
     
     export function getStrapiClient(event: RequestEvent) {
       const jwt = event.cookies.get('jwt');
       
       return createStrapiClient({
         baseURL: env.STRAPI_API_URL,
         auth: jwt ?? undefined
       });
     }
     ```

2. **User Service Functions**
   - Create Strapi user interaction methods in `src/lib/server/strapi/user.ts`:
     ```typescript
     import { getStrapiClient } from './client';
     import type { RequestEvent } from '@sveltejs/kit';
     
     export async function getCurrentUser(jwt: string) {
       try {
         const response = await fetch(`${process.env.STRAPI_API_URL}/users/me?populate=role`, {
           headers: {
             Authorization: `Bearer ${jwt}`,
             'Content-Type': 'application/json'
           }
         });
         
         if (!response.ok) return null;
         return await response.json();
       } catch (error) {
         console.error('Error fetching current user:', error);
         return null;
       }
     }
     
     export async function getUserById(id: string, event: RequestEvent) {
       try {
         const strapi = getStrapiClient(event);
         return await strapi.collection('users').findOne(id, {
           populate: ['role']
         });
       } catch (error) {
         console.error('Error fetching user by ID:', error);
         return null;
       }
     }
     ```

## 3. Server Hooks for Authentication

1. **Global Auth Hook Implementation**
   - Set up authentication handling in `src/hooks.server.ts`:
     ```typescript
     import type { Handle } from '@sveltejs/kit';
     import { getUserFromJwt } from '$lib/utils/auth';
     
     export const handle: Handle = async ({ event, resolve }) => {
       // Extract JWT token
       const token = event.cookies.get('jwt');
       
       // Try to use cached user from cookie first for better performance
       const userCookie = event.cookies.get('user');
       let user = null;
       
       if (userCookie) {
         try {
           user = JSON.parse(decodeURIComponent(userCookie));
         } catch (err) {
           console.error('Error parsing user cookie:', err);
           user = token ? await getUserFromJwt(token, event) : null;
         }
       } else if (token) {
         user = await getUserFromJwt(token, event);
       }
       
       // Set user in locals for access in load functions
       event.locals.user = user;
       
       return await resolve(event);
     };
     ```

## 4. Login Page Implementation

1. **Login Form Component**
   - Create or update `src/routes/login/+page.svelte`:
     ```svelte
     <script lang="ts">
       import { enhance } from '$app/forms';
       
       let email = $state('');
       let password = $state('');
       let loading = $state(false);
       let { data } = $props<{ data: { error?: string } }>();
       let error = $state<string | null>(data.error ?? null);
     </script>
     
     <svelte:head>
       <title>Login | TributeStream</title>
       <meta name="description" content="Log in to your TributeStream account" />
     </svelte:head>
     
     <div class="login-container">
       <div class="login-card">
         <h1>Login</h1>
         
         <form method="POST" use:enhance={({ formData, result }) => {
           loading = true;
           
           return async () => {
             loading = false;
             if (result.type === 'failure') {
               error = result.data?.error;
             }
             // For success, SvelteKit handles the redirect
           };
         }}>
           {#if error}
             <div class="error-message">
               {error}
             </div>
           {/if}
           
           <div class="form-group">
             <label for="email">Email</label>
             <input 
               type="email" 
               id="email" 
               name="email"
               bind:value={email} 
               disabled={loading}
               placeholder="Enter your email"
               autocomplete="email"
               required
             />
           </div>
           
           <div class="form-group">
             <label for="password">Password</label>
             <input 
               type="password" 
               id="password" 
               name="password"
               bind:value={password} 
               disabled={loading}
               placeholder="Enter your password"
               autocomplete="current-password"
               required
             />
           </div>
           
           <button type="submit" class="login-button" disabled={loading}>
             {loading ? 'Logging in...' : 'Login'}
           </button>
         </form>
         
         <div class="links">
           <a href="/forgot-password">Forgot password?</a>
           <a href="/register">Create an account</a>
         </div>
       </div>
     </div>
     ```

2. **Login Server Action**
   - Implement `src/routes/login/+page.server.ts`:
     ```typescript
     import { fail, redirect } from '@sveltejs/kit';
     import type { Actions, PageServerLoad } from './$types';
     
     export const load: PageServerLoad = async ({ locals }) => {
       // Redirect to portal if already logged in
       if (locals.user) throw redirect(303, '/my-portal');
       return {};
     };
     
     export const actions: Actions = {
       default: async ({ request, fetch, cookies }) => {
         // Process form data
         const formData = await request.formData();
         const email = formData.get('email');
         const password = formData.get('password');
         
         // Validate form inputs
         if (typeof email !== 'string' || typeof password !== 'string') {
           return fail(400, { error: 'Invalid form submission' });
         }
         
         // Forward authentication request to internal API
         const res = await fetch('/api/auth/login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ identifier: email, password })
         });
         
         // Handle API response
         if (!res.ok) {
           const data = await res.json();
           return fail(res.status, { error: data.error || 'Login failed' });
         }
         
         // Extract successful login data
         const data = await res.json();
         
         // Set cookies for client
         cookies.set('jwt', data.jwt, {
           httpOnly: true,
           secure: true,
           sameSite: 'lax',
           path: '/'
         });
         
         // Store user data in cookie to reduce JWT verification overhead
         const userValue = encodeURIComponent(JSON.stringify(data.user));
         cookies.set('user', userValue, {
           httpOnly: true,
           secure: true,
           sameSite: 'lax',
           path: '/'
         });
         
         // Redirect to portal
         throw redirect(303, '/my-portal');
       }
     };
     ```

## 5. Authentication API Endpoint

1. **Login API Implementation**
   - Create `src/routes/api/auth/login/+server.ts`:
     ```typescript
     import type { RequestHandler } from './$types';
     import { getCurrentUser } from '$lib/server/strapi/user';
     
     export const POST: RequestHandler = async ({ request, cookies }) => {
       try {
         const body = await request.json();
         
         // Forward authentication request to Strapi
         const res = await fetch('https://miraculous-morning-0acdf6e165.strapiapp.com/api/auth/local', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(body)
         });
         
         const data = await res.json();
         
         if (res.ok && data.jwt) {
           // Set JWT cookie
           cookies.set('jwt', data.jwt, {
             httpOnly: true,
             secure: true,
             sameSite: 'lax',
             path: '/'
           });
           
           // Fetch full user data with role information
           const fullUser = await getCurrentUser(data.jwt);
           
           // Set user cookie
           const userValue = encodeURIComponent(JSON.stringify(fullUser));
           cookies.set('user', userValue, {
             httpOnly: true,
             secure: true,
             sameSite: 'lax',
             path: '/'
           });
           
           // Return success with user data
           return new Response(JSON.stringify({
             ...data,
             user: fullUser
           }), {
             status: 200,
             headers: { 'Content-Type': 'application/json' }
           });
         } else {
           // Return error from Strapi
           return new Response(JSON.stringify(data), {
             status: res.status,
             headers: { 'Content-Type': 'application/json' }
           });
         }
       } catch (error) {
         // Handle unexpected errors
         return new Response(JSON.stringify({ error: 'Internal server error' }), {
           status: 500,
           headers: { 'Content-Type': 'application/json' }
         });
       }
     };
     ```

## 6. Portal Page Implementation

1. **Portal Page Load Function**
   - Implement `src/routes/my-portal/+page.server.ts`:
     ```typescript
     import type { PageServerLoad } from './$types';
     import { error, redirect } from '@sveltejs/kit';
     import { getUserFromJwt } from '$lib/utils/auth';
     import { getStrapiClient } from '$lib/server/strapi/client';
     
     export const load: PageServerLoad = async (event) => {
       const { cookies } = event;
       
       // Fetch tributes for the user
       const strapiClient = getStrapiClient(event);
       const tributes = await strapiClient.collection('tributes').find();
       
       // Get JWT and check user authentication
       const jwt = cookies.get('jwt');
       const userJwt = jwt ? await getUserFromJwt(jwt, event) : null;
       
       if (!userJwt) {
         // Redirect to login if not authenticated
         throw redirect(302, '/login');
       }
       
       return {
         tributes: tributes.data,
         user: userJwt
       };
     };
     ```

2. **Portal Page Component**
   - Create `src/routes/my-portal/+page.svelte`:
     ```svelte
     <script lang="ts">
       import AdminPortal from '$lib/components/dashboard/AdminPortal.svelte';
       import ContributorPortal from '$lib/components/dashboard/ContributorPortal.svelte';
       import FuneralDirectorPortal from '$lib/components/dashboard/FuneralDirectorPortal.svelte';
       import FamilyContactPortal from '$lib/components/dashboard/FamilyContactPortal.svelte';
       import ProducerPortal from '$lib/components/dashboard/ProducerPortal.svelte';
       import PageBackground from '$lib/components/ui/PageBackground.svelte';
       import type { Tribute } from '$lib/types/tribute';
       
       interface PageData {
         user: { id: string; name: string; email: string; role: { type: string } };
         tributes: Tribute[];
       }
       
       let { data } = $props<{ data: PageData }>();
     </script>
     
     <svelte:head>
       <title>{data?.user?.name ? 'My Tributes' : 'Login'} | Tributestream</title>
       <meta name="description" content="Access your Tributestream account and manage your tributes." />
     </svelte:head>
     
     <PageBackground variant="my-portal" opacity={0.95} />
     
     <div class="container min-h-screen px-4 py-16 mx-auto">
       <div class="max-w-4xl w-full mx-auto">
         <div class="bg-surface-100/95 rounded-lg shadow-lg overflow-hidden">
           <div class="p-6 md:p-8">
             <div class="flex justify-between items-center mb-8">
               <h1 class="text-3xl md:text-4xl font-bold">
                 My Tributes
               </h1>
               
               <form method="POST" action="?/logout">
                 <button type="submit" class="btn">Log Out</button>
               </form>
             </div>
             
             <div class="mb-8">
               <p>
                 {#if data?.user?.name}
                   Welcome back, <span class="font-medium">{data.user.name}</span>.
                   Here are the tributes associated with your account.
                 {:else}
                   Welcome to Tributestream.
                 {/if}
               </p>
             </div>
             
             <svelte:boundary>
               {#if data?.user?.role?.type === 'admin'}
                 <AdminPortal user={data.user} tributes={data.tributes} />
               {:else if data?.user?.role?.type === 'contributor'}
                 <ContributorPortal tributes={data.tributes} />
               {:else if data?.user?.role?.type === 'funeral-director'}
                 <FuneralDirectorPortal tributes={data.tributes} />
               {:else if data?.user?.role?.type === 'family-contact'}
                 <FamilyContactPortal tributes={data.tributes} />
               {:else if data?.user?.role?.type === 'producer'}
                 <ProducerPortal tributes={data.tributes} />
               {:else if data?.user}
                 <p class="text-red-600">Unknown role: {JSON.stringify(data.user.role)}</p>
               {:else}
                 <p class="text-red-600">No user data available.</p>
               {/if}
               
               {#snippet failed(error, reset)}
                 <div class="text-red-700 bg-red-100 border border-red-300 p-4 rounded">
                   <p class="font-semibold">Something went wrong loading your portal.</p>
                   <p class="text-sm mt-2">{error.message}</p>
                   <button class="btn mt-4" onclick={reset}>Try again</button>
                 </div>
               {/snippet}
             </svelte:boundary>
           </div>
         </div>
       </div>
     </div>
     ```

## 7. Role-Based Portal Components

1. **Base Portal Component**
   - Create `src/lib/components/dashboard/BasePortal.svelte`:
     ```svelte
     <script lang="ts">
       import type { Tribute } from '$lib/types/tribute';
       import TributeGrid from '$lib/components/tributes/tribute-grid.svelte';
       
       let { tributes = [] } = $props<{ tributes: Tribute[] }>();
     </script>
     
     <div class="base-portal">
       <slot name="header">
         <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
       </slot>
       
       {#if tributes.length > 0}
         <TributeGrid {tributes} />
       {:else}
         <p>You don't have any tributes associated with your account.</p>
       {/if}
       
       <slot name="actions"></slot>
     </div>
     ```

2. **Implement Each Role-Specific Portal**
   - Create role-specific components extending the base:
   
   a. `src/lib/components/dashboard/AdminPortal.svelte`:
   ```svelte
   <script lang="ts">
     import BasePortal from './BasePortal.svelte';
     import type { Tribute } from '$lib/types/tribute';
     
     let { tributes, user } = $props<{ 
       tributes: Tribute[],
       user: { id: string; name: string; email: string; } 
     }>();
   </script>
   
   <BasePortal {tributes}>
     <h2 slot="header" class="text-xl font-semibold mb-4">Admin Dashboard</h2>
     
     <div slot="actions" class="mt-6">
       <h3 class="text-lg font-medium mb-3">Admin Actions</h3>
       <div class="flex flex-wrap gap-3">
         <a href="/admin/tributes" class="btn">Manage All Tributes</a>
         <a href="/admin/users" class="btn">Manage Users</a>
       </div>
     </div>
   </BasePortal>
   ```
   
   b. `src/lib/components/dashboard/ContributorPortal.svelte`:
   ```svelte
   <script lang="ts">
     import BasePortal from './BasePortal.svelte';
     import type { Tribute } from '$lib/types/tribute';
     
     let { tributes } = $props<{ tributes: Tribute[] }>();
   </script>
   
   <BasePortal {tributes}>
     <h2 slot="header" class="text-xl font-semibold mb-4">Contributor Dashboard</h2>
     
     <div slot="actions" class="mt-6">
       <h3 class="text-lg font-medium mb-3">Quick Actions</h3>
       <div class="flex flex-wrap gap-3">
         <a href="/contribute" class="btn">Add Contribution</a>
       </div>
     </div>
   </BasePortal>
   ```
   
   c. Similar implementation for FuneralDirectorPortal, FamilyContactPortal, and ProducerPortal components.

## 8. Logout Functionality

1. **Logout API Endpoint**
   - Create `src/routes/api/auth/logout/+server.ts`:
     ```typescript
     import type { RequestHandler } from './$types';
     import { redirect } from '@sveltejs/kit';
     
     export const POST: RequestHandler = async ({ cookies }) => {
       // Clear authentication cookies
       cookies.delete('jwt', { path: '/' });
       cookies.delete('user', { path: '/' });
       cookies.delete('jwt_expires', { path: '/' });
       
       // Redirect to login page
       throw redirect(303, '/login');
     };
     ```

2. **Logout Action in Portal**
   - Add logout endpoint to portal page:
     ```typescript
     // src/routes/my-portal/+page.server.ts
     export const actions: Actions = {
       logout: async ({ cookies }) => {
         cookies.delete('jwt', { path: '/' });
         cookies.delete('user', { path: '/' });
         cookies.delete('jwt_expires', { path: '/' });
         
         throw redirect(302, '/login');
       }
     };
     ```

## 9. Error Handling and Security

1. **JWT Verification Error Handling**
   - Update JWT verification to handle expired tokens:
     ```typescript
     try {
       // JWT verification code
     } catch (err) {
       if (err instanceof errors.JWTExpired) {
         // Handle expired token
         console.error('Token expired:', err.message);
         throw new TokenExpiredError('Authentication token expired');
       } else {
         // Other JWT verification errors
         console.error('JWT verification failed:', err);
         return null;
       }
     }
     ```

2. **Error Boundary in Portal**
   - Implement error boundaries to handle component errors:
     ```svelte
     <svelte:boundary>
       <!-- Role-specific components here -->
       
       {#snippet failed(error, reset)}
         <div class="error-container">
           <p class="error-title">Something went wrong</p>
           <p class="error-message">{error.message}</p>
           <button onclick={reset}>Try again</button>
         </div>
       {/snippet}
     </svelte:boundary>
     ```

## 10. Sequential Implementation Steps

1. Set up authentication utilities (`auth.ts` and `jwt.ts`) and Strapi client
2. Implement server hooks for global authentication
3. Create the login page component and server actions
4. Develop the API authentication endpoint
5. Create the portal page load function and component
6. Implement base and role-specific portal components
7. Add logout functionality
8. Integrate error handling and security measures
9. Test the complete authentication flow

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant LoginComp as Login Component
    participant LoginAction as Login Server Action
    participant API as Auth API Endpoint
    participant Strapi as Strapi Auth
    participant Hook as Server Hooks
    participant Portal as Portal Page
    participant RoleComp as Role Component

    User->>LoginComp: Submit credentials
    LoginComp->>LoginAction: POST form data
    LoginAction->>API: POST auth request
    API->>Strapi: Authenticate with Strapi
    Strapi-->>API: Return JWT + user data
    API-->>LoginAction: Set cookies & return user
    LoginAction-->>User: Redirect to /my-portal
    User->>Portal: Request portal page
    Portal->>Hook: Process request, validate JWT
    Hook->>Portal: Provide user in locals
    Portal->>RoleComp: Select component by user.role
    RoleComp->>User: Render role-specific UI