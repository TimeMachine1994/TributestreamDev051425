# Login → My Portal Data Flow

This document describes how data flows from the login form to the "My Portal" page in the SvelteKit application.

## 1. Login Form

In [`src/routes/login/+page.svelte:1`](src/routes/login/+page.svelte:1), the login form uses SvelteKit's `use:enhance` to handle submissions via JavaScript:

- Binds `email` and `password` inputs to component state.
- Uses `<form method="POST" use:enhance(...)>` to intercept the submit event.

On submit, the form POSTs to the **default action** in [`src/routes/login/+page.server.ts:15`](src/routes/login/+page.server.ts:15).

## 2. Server Form Action

In [`src/routes/login/+page.server.ts:15`](src/routes/login/+page.server.ts:15), the `actions.default` function:

1. Reads and validates `request.formData()` (lines 20–31).
2. Proxies credentials to the internal API endpoint via `fetch('/api/auth/login', …)` ([`src/routes/api/auth/login/+server.ts:1`](src/routes/api/auth/login/+server.ts:1)).
3. If the API response is not OK, returns `fail(status, { error })`. The form enhancer then displays the error.
4. If the API response is OK, throws `redirect(303, '/my-portal')`.

## 3. Client-Side Redirect

The form enhancer automatically follows the 303 redirect and navigates the browser to `/my-portal`.

## 4. Portal Page Load

In [`src/routes/my-portal/+page.server.ts:1`](src/routes/my-portal/+page.server.ts:1), the `load` function:

- Reads `locals.user` to ensure the user is authenticated.
- Fetches the user’s `tributes`.
- If no `locals.user`, throws a redirect back to `/login`.

## 5. Portal Page Component

In [`src/routes/my-portal/+page.svelte:1`](src/routes/my-portal/+page.svelte:1), the component:

- Receives `{ data: { user, tributes } }` as a prop.
- Renders the appropriate sub-component (`ContributorPortal`, `FuneralDirectorPortal`, etc.) based on `data.user.role`.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Login Component
    participant S as Login Action
    participant API as /api/auth/login
    participant P as Portal Load
    participant V as Portal Component

    U->>C: submit(email, password)
    Note over C,S: use:enhance intercepts
    C->>S: POST to action.default
    S->>API: POST {identifier, password}
    API-->>S: 200 OK + auth cookie
    alt success
        S-->>C: 303 Redirect to /my-portal
        C->>P: GET /my-portal
        P-->>V: 200 + { user, tributes }
        V->>U: render portal based on data.user.role
    else failure
        S-->>C: 400 + {error}
        C->>C: display error
    end

    Status so far: 
    # Analysis of Login to My Portal Authentication Flow

Based on my comprehensive review of the `login-to-portal-flow.md` document and examination of the related source files, here's a detailed analysis of the authentication flow and the files involved:

## Core Files and Their Purposes

### 1. Login Page Files
- **`src/routes/login/+page.svelte`**:
  - Renders the login UI with form inputs for email and password
  - Uses `use:enhance` for progressive form enhancement
  - Displays error messages when authentication fails
  - Contains UI styling for the login page

- **`src/routes/login/+page.server.ts`**:
  - Redirects already authenticated users to portal (`locals.user` check)
  - Processes form submissions via the default action
  - Validates form data (email and password)
  - Proxies authentication request to internal API endpoint
  - Sets JWT and user cookies on successful authentication
  - Redirects to the portal page on success (303 redirect)

### 2. Authentication API Endpoint
- **`src/routes/api/auth/login/+server.ts`**:
  - Receives login request from page action
  - Communicates with external Strapi auth endpoint
  - Sets HTTP-only secure cookies with JWT token
  - Fetches the complete user profile using the JWT token
  - Returns success/error responses to the client

### 3. Strapi Utilities
- **`src/lib/server/strapi/client.ts`**:
  - Creates connection to Strapi backend
  - Retrieves JWT from cookies for authenticated requests
  - Initializes the Strapi client with base URL and auth token

- **`src/lib/server/strapi/user.ts`**:
  - Provides functions for user CRUD operations
  - Contains `getCurrentUser` function to fetch user data with JWT

### 4. Authentication Utilities
- **`src/lib/utils/auth.ts`**:
  - Contains helper functions for auth operations 
  - Includes `getUserFromJwt` wrapper function
  - Provides `setAuthCookies` function for consistent cookie management

- **`src/lib/utils/jwt.ts`**:
  - Verifies JWT signatures using environment secret
  - Extracts user information from tokens
  - Handles token expiration errors
  - Fetches full user profile from Strapi using token claims

### 5. Server Hooks
- **`src/hooks.server.ts`**:
  - Executes on every request to populate `event.locals.user`
  - Extracts JWT token from cookies
  - Attempts to parse user from cookie or JWT
  - Makes user data available to all routes via `locals`

### 6. My Portal Page
- **`src/routes/my-portal/+page.server.ts`**:
  - Validates user authentication status
  - Redirects unauthenticated users to login page
  - Fetches tributes associated with the authenticated user
  - Returns user and tribute data to the page component

- **`src/routes/my-portal/+page.svelte`**:
  - Renders the portal UI based on user data
  - Conditionally displays different portal components based on user role:
    - AdminPortal
    - ContributorPortal
    - FuneralDirectorPortal
    - FamilyContactPortal
    - ProducerPortal
  - Contains error handling via `svelte:boundary`
  - Provides logout functionality

### 7. Type Definitions
- **`src/lib/types/types.ts`**:
  - Provides TypeScript interfaces for User, Tribute, and other entities
  - Defines role structures and authorization types

## Missing Files/Components

Based on my analysis, there are several components that appear to be missing or would benefit from additional implementation:

1. **Logout Handler**: 
   - The portal page has a logout form that submits to `?/logout`, but there's no corresponding action defined in `my-portal/+page.server.ts` to handle this.
   - A proper logout handler would need to clear the JWT and user cookies.

2. **JWT Refresh Mechanism**:
   - There's no apparent mechanism to refresh JWT tokens before they expire.
   - A token refresh endpoint (perhaps `src/routes/api/auth/refresh/+server.ts`) would be valuable.

3. **Authentication Error Recovery**:
   - While there's error handling for token expiration, there's no clear mechanism for redirecting users back to login when their token expires during an active session.
   - A middleware or interception layer could be added to handle 401/403 responses.

4. **Session Management**:
   - The current implementation uses cookies directly but lacks a cohesive session management system.
   - A dedicated session service could provide more robust session handling.

5. **Role-Based Access Control (RBAC)**:
   - While the portal UI is conditionally rendered based on user role, there's no comprehensive RBAC system to protect API endpoints.
   - A role-based middleware would strengthen security.

6. **Type Consistency**:
   - There are inconsistencies in the User type definitions between files.
   - The `role` property in some places is a string, elsewhere it's an object with `type`, `id`, and `name`.

7. **Auth Middleware**:
   - A reusable auth middleware function for protecting routes would be valuable.
   - This could be implemented as a helper that throws a redirect for unauthenticated requests.

8. **API Route for Logout**:
   - An `src/routes/api/auth/logout/+server.ts` endpoint would be needed to handle logout functionality from the UI.

These missing components should be addressed to create a more robust authentication flow and user experience.