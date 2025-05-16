# Comprehensive SvelteKit Application Debugging Analysis

Based on examining the key files in the TributeStream project, I've documented the variables, data flow, and potential issues in the following sections. This analysis will help identify inconsistencies, placeholders, and provide a foundation for any necessary refactoring.

## 1. Application Entry Points

### Variables and Data Flow
- **Root Layout (`src/routes/+layout.svelte`)**:
  - Simple structure with Header and Footer
  - Uses `$props()` for children, following Svelte 5 runes pattern

- **Main Page (`src/routes/+page.svelte`)**:
  - Complex state machine pattern using multiple `$state` variables:
    - `formState`: 'initial', 'searching', 'creating', 'submitting', 'success'
    - Form fields: `searchTerm`, `creatorFullName`, `creatorPhone`, `creatorEmail`
    - UI flags: `isSubmitting`, `isSearching`, `showQuickCreateForm`, etc.
  - Reactive derived values using `$derived` rune:
    - `slugifiedName`: Converts search term to URL slug
    - `customLink`: Generates celebration of life URL
    - Multiple validation fields (`isNameValid`, `isEmailValid`, etc.)
  - Form submission handled by SvelteKit form actions

- **Server Actions (`src/routes/+page.server.ts`)**:
  - Two main actions: `search` and `createMemorial`
  - `createMemorial` follows a multi-step process:
    1. Validate form data
    2. Generate secure password
    3. Register user
    4. Authenticate user
    5. Store auth cookies
    6. Create user metadata
    7. Create tribute record
    8. Send welcome email
    9. Redirect to new tribute page

### Inconsistencies/Issues
- Extensive console.log statements throughout server-side code
- Hardcoded URLs (https://wp.tributestream.com) in multiple locations
- Comment indicating potentially outdated video ID: `src="https://player.vimeo.com/video/1074841232?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"`
- Unclear form error handling mechanism between client/server
- Many TODOs identified in auth-helpers.ts indicating incomplete Strapi integration

## 2. Authentication System

### Variables and Data Flow
- **JWT Implementation (`src/lib/server/auth/jwt.ts`)**:
  - `getUserFromToken`: Verifies JWT and fetches user from Strapi
  - `extractTokenFromCookie`: Helper for cookie parsing
  - Throws `TokenExpiredError` to specifically handle expired tokens

- **Auth Service (`src/lib/services/auth-service.ts`)**:
  - Svelte store providing auth state: `isAuthenticated` and `user`
  - Key methods:
    - `login`: Submits credentials to `/my-portal?/login` endpoint
    - `logout`: Clears cookies and state
    - `checkAuth`: Verifies auth status via `/api/auth/check` endpoint

- **Login Form (`src/lib/components/auth/login-form.svelte`)**:
  - Uses `sveltekit-superforms` for form handling
  - Form state: `isSubmitting`, `showPassword`
  - Simple form fields: username, password

- **Auth Helpers (`src/lib/utils/auth-helpers.ts`)**:
  - Many commented/disabled functions with TODOs:
    - `setAuthCookies`
    - `storeMasterDataInUserMeta`
    - `getUserFromCookies`
    - `loadUserData`
    - `sendWelcomeEmail`
  - Active functions:
    - `generateSecurePassword`
    - `hashPassword`
    - `convertMasterStoreToUserMeta`

### Inconsistencies/Issues
- Mix of WordPress JWT and Strapi authentication mechanisms
- Multiple TODOs for Strapi integration in auth-helpers.ts
- Logging sensitive data (tokens) in JWT functions
- No clear token refresh mechanism for expired tokens
- Inconsistent authentication flows between `/login` and `/my-portal?/login`

## 3. Tribute Management System

### Variables and Data Flow
- **Tribute Store (`src/lib/stores/tribute-store.svelte.ts`)**:
  - State machine pattern with states: IDLE, LOADING, SAVING, DELETING, ERROR, SUCCESS
  - Key state variables:
    - `currentTribute`: Currently viewed/edited tribute
    - `searchResults`: Results from tribute search
    - `error`: Error message string
    - `validationErrors`: Validation errors object
  - Derived states: `isLoading`, `isSaving`, `isDeleting`, `hasError`, `isSuccess`
  - CRUD operations: `fetchTribute`, `fetchTributeBySlug`, `searchTributes`, `createTribute`, `updateTribute`, `deleteTribute`
  - Context system with `setTributeStoreContext` and `getTributeStoreContext`

- **Tribute Page (`src/routes/celebration-of-life-for-[slug]/+page.svelte`)**:
  - Simple display component for tribute data
  - Receives data from server load function
  - Handles two content cases:
    - Default video player if `custom_html` is null
    - Custom HTML content if available

### Inconsistencies/Issues
- References to Backbone.js model systems that may be outdated:
  - `modelRegistry.fetchModel<Tribute>(ModelTypes.TRIBUTE, numericId)`
- Mixed approach to API requests:
  - Direct fetch calls in some places
  - Model-based fetching in others
- Possible missing validation in custom HTML rendering (security concern)
- Undefined `lovedOneName` in celebration page if tribute loading fails

## 4. Dashboard & Portal System

### Variables and Data Flow
- **Dashboard Layout (`src/routes/dashboard/+layout.svelte`)**:
  - Uses `authStore` for authentication status
  - Calls `initializeBackbone()` on mount
  - Redirects to login if unauthorized
  - Simple layout structure: Header, Sidebar, main content, Footer

- **My Portal Page (`src/routes/my-portal/+page.server.ts`)**:
  - Uses Strapi client to fetch tributes for current user
  - Role-based routing logic:
    - Redirects admins to '/admin'
    - Validates user roles ('contributor', 'funeral-director', 'family-contact', 'producer')
    - Redirects invalid roles to login

### Inconsistencies/Issues
- Mismatch between `initializeBackbone` and Strapi integration
- No clear role-based component rendering in dashboard UI
- Missing +page.svelte implementation for my-portal
- Incomplete portal-specific functionality
- Unclear handling of dashboard data loading states

## 5. Strapi Integration

### Variables and Data Flow
- **Strapi Client (`src/lib/server/strapi/client.ts`)**:
  - Simple client initialization using @strapi/client
  - Uses environment variables for configuration:
    - `STRAPI_API_URL`
    - `STRAPI_API_TOKEN`

- **Strapi Usage In Pages**:
  - My Portal page fetches tributes with: `strapi.collection('tributes').find()`
  - JWT validation fetches user with: `strapi.collection('users').findOne(userId)`

### Inconsistencies/Issues
- Multiple authentication systems:
  - WordPress/custom JWT in some places
  - Strapi in others
- Inconsistent HTTP client usage (fetch vs Strapi client)
- Environment variables might not be properly configured
- Error handling for Strapi requests is inconsistent
- Strapi query builder pattern not fully utilized

## 6. Form Handling & State Management

### Variables and Data Flow
- **Form Actions**: 
  - Homepage uses custom form actions with state machine pattern
  - Login form uses SuperForms library
  - Inconsistent approach to form handling

- **State Management**:
  - Multiple approaches:
    - Svelte 5 runes (`$state`, `$derived`, `$effect`)
    - Svelte stores (auth-service)
    - Stores with context API (tribute-store)
    - Server-side state (page.server.ts)

### Inconsistencies/Issues
- Inconsistent form validation approaches
- Mixed client/server validation
- Multiple state management patterns
- Form errors handling varies between components

## Overall System Integration Issues

1. **Authentication Transition**:
   - System appears to be transitioning from WordPress to Strapi
   - Multiple authentication methods coexist
   - TODOs indicate incomplete migration

2. **Redundant Code**:
   - Commented functions with TODOs
   - Multiple implementations of similar functionality

3. **Inconsistent Patterns**:
   - Mix of modern Svelte 5 runes and older patterns
   - Inconsistent error handling approaches
   - Variable component structure

4. **Design Pattern Conflicts**:
   - State machine vs store-based approaches
   - Direct API calls vs model-based operations
   - Form handling with actions vs libraries

5. **Integration Issues**:
   - WordPress to Strapi transition seems incomplete
   - Backbone.js integration might be legacy code
   - Authentication flow has multiple mechanisms

This analysis provides a comprehensive overview of the codebase structure, variables, and potential issues. The next steps would be to address the identified inconsistencies and complete the migration to a consistent architecture pattern.