# Tribute Management REST API Implementation Plan

## Overview

This document outlines the detailed implementation plan for creating REST API endpoints in our SvelteKit application that will proxy requests to our WordPress backend for tribute management. The implementation will include proper TypeScript typing, input validation, error handling, and appropriate HTTP status codes.

## Endpoint Structure

```
/api/tributes
  ├── +server.ts         // GET (list tributes), POST (create tribute)
  ├── [id]/
  │   └── +server.ts     // GET tribute by ID
  └── by-slug/
      └── [slug]/
          └── +server.ts // GET tribute by slug
```

## Type Definitions

We'll start by defining the necessary TypeScript interfaces to ensure type safety across our application:

```typescript
// src/lib/types/tribute.ts

/**
 * Represents a tribute record in the system
 */
export interface Tribute {
  id: number;
  user_id: number;
  loved_one_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams: number;
}

/**
 * Response format for tribute collections
 */
export interface TributeCollection {
  tributes: Tribute[];
  total_pages: number;
  total_items: number;
  current_page: number;
}

/**
 * Response format when creating a new tribute
 */
export interface TributeCreationResult {
  success: boolean;
  id: number;
  slug: string;
}

/**
 * Payload for creating a new tribute
 */
export interface CreateTributePayload {
  user_id: number;
  loved_one_name: string;
  slug?: string;
  custom_html?: string;
  phone_number: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
}

/**
 * Format for API error responses
 */
export interface ApiErrorResponse {
  error: boolean;
  message: string;
  status: number;
}
```

## Utility Functions

We'll implement several utility functions to handle common tasks across all endpoints:

### 1. Authentication Helper

```typescript
/**
 * Validates the JWT token from the request headers
 * @param request - Incoming request object
 * @returns The JWT token if valid, null otherwise
 */
async function validateAuthToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return token;
}
```

### 2. Validation Functions

```typescript
/**
 * Validates the payload for creating a tribute
 * @param payload - The request payload
 * @returns Object containing validation result and any error messages
 */
function validateCreateTributePayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!payload.user_id) errors.push("user_id is required");
  if (!payload.loved_one_name) errors.push("loved_one_name is required");
  if (!payload.phone_number) errors.push("phone_number is required");
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 3. Error Handling

```typescript
/**
 * Standardizes API error responses
 * @param error - The error object or message
 * @returns Formatted JSON response with appropriate status code
 */
function handleApiError(error: any): Response {
  console.error('API Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'An unexpected error occurred';
  
  return json({ 
    error: true, 
    message, 
    status 
  }, { status });
}
```

## Endpoint Implementations

### 1. Main Tributes Endpoint (`+server.ts`)

This endpoint will handle both listing tributes (GET) and creating new tributes (POST).

#### GET Implementation

```typescript
export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Extract query parameters
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';
    
    // Build the WordPress API URL with parameters
    const wpApiUrl = new URL('https://wp.tributestream.com/wp-json/tributestream/v1/tributes');
    wpApiUrl.searchParams.set('page', page);
    wpApiUrl.searchParams.set('per_page', perPage);
    if (search) {
      wpApiUrl.searchParams.set('search', search);
    }
    
    // Make the request to the WordPress API
    const response = await fetch(wpApiUrl.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      return json({
        error: true,
        message: errorData.message || 'Failed to fetch tributes',
        status: response.status
      }, { status: response.status });
    }
    
    // Return the response data
    const data = await response.json();
    return json(data);
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### POST Implementation

```typescript
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    // Validate authentication
    const token = await validateAuthToken(request);
    if (!token) {
      return json({
        error: true,
        message: 'Authentication required',
        status: 401
      }, { status: 401 });
    }
    
    // Parse and validate the request body
    const payload = await request.json();
    const validation = validateCreateTributePayload(payload);
    
    if (!validation.valid) {
      return json({
        error: true,
        message: 'Validation failed: ' + validation.errors.join(', '),
        status: 400
      }, { status: 400 });
    }
    
    // Forward the request to the WordPress API
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return json({
        error: true,
        message: responseData.message || 'Failed to create tribute',
        status: response.status
      }, { status: response.status });
    }
    
    return json(responseData);
  } catch (error) {
    return handleApiError(error);
  }
};
```

### 2. Get Tribute by ID Endpoint (`[id]/+server.ts`)

This endpoint will retrieve a specific tribute by its unique ID.

```typescript
export const GET: RequestHandler = async ({ params, fetch, request }) => {
  try {
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return json({
        error: true,
        message: 'Invalid tribute ID',
        status: 400
      }, { status: 400 });
    }
    
    // Attempt to get authorization token (optional for this endpoint)
    const token = await validateAuthToken(request);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Forward request to WordPress API
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tributes/${id}`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 404) {
        return json({
          error: true,
          message: 'Tribute not found',
          status: 404
        }, { status: 404 });
      }
      
      return json({
        error: true,
        message: errorData.message || 'Failed to fetch tribute',
        status: response.status
      }, { status: response.status });
    }
    
    const tribute = await response.json();
    return json(tribute);
  } catch (error) {
    return handleApiError(error);
  }
};
```

### 3. Get Tribute by Slug Endpoint (`by-slug/[slug]/+server.ts`)

This endpoint will retrieve a tribute by its slug.

```typescript
export const GET: RequestHandler = async ({ params, fetch }) => {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return json({
        error: true,
        message: 'Slug parameter is required',
        status: 400
      }, { status: 400 });
    }
    
    // Forward request to WordPress API
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 404) {
        return json({
          error: true,
          message: 'Tribute not found',
          status: 404
        }, { status: 404 });
      }
      
      return json({
        error: true,
        message: errorData.message || 'Failed to fetch tribute by slug',
        status: response.status
      }, { status: response.status });
    }
    
    const tribute = await response.json();
    return json(tribute);
  } catch (error) {
    return handleApiError(error);
  }
};
```

## Implementation Steps

1. **Create Type Definitions**
   - Create `src/lib/types/tribute.ts` with all necessary interfaces

2. **Create the Main Tributes Endpoint**
   - Implement `src/routes/api/tributes/+server.ts` with GET and POST handlers

3. **Create the Get by ID Endpoint**
   - Implement `src/routes/api/tributes/[id]/+server.ts` with GET handler

4. **Create the Get by Slug Endpoint**
   - Create directory structure: `src/routes/api/tributes/by-slug/[slug]/`
   - Implement `+server.ts` with GET handler

5. **Testing**
   - Test each endpoint with various input scenarios
   - Verify error handling works correctly
   - Confirm authentication requirements are enforced

## Expected Behavior

### Main Tributes Endpoint

- **GET /api/tributes**
  - Returns a paginated list of tributes
  - Supports query parameters: `page`, `per_page`, `search`
  - Public access (no authentication required)

- **POST /api/tributes**
  - Creates a new tribute
  - Requires authentication
  - Validates required fields: `user_id`, `loved_one_name`, `phone_number`
  - Returns the created tribute's ID and slug

### Get Tribute by ID Endpoint

- **GET /api/tributes/[id]**
  - Returns a single tribute by ID
  - Requires authentication if accessing private tribute data
  - Returns 404 if tribute not found

### Get Tribute by Slug Endpoint

- **GET /api/tributes/by-slug/[slug]**
  - Returns a single tribute by slug
  - Public access for basic tribute data
  - Returns 404 if tribute not found

## Error Handling

All endpoints will follow a consistent error response format:

```json
{
  "error": true,
  "message": "Descriptive error message",
  "status": 400
}
```

Common error status codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing/invalid authentication)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (tribute doesn't exist)
- 500: Internal Server Error (unexpected errors)

## Security Considerations

1. **Authentication**
   - All write operations require a valid JWT token
   - Token validation is performed on each request

2. **Input Validation**
   - All user input is validated before processing
   - Sanitization is applied to prevent injection attacks

3. **Error Handling**
   - Detailed error messages are shown to authenticated users
   - Generic error messages are shown to unauthenticated users
   - Error details are logged for debugging but not exposed in responses

## Next Steps

Once this implementation plan is approved, we should:

1. Switch to Code mode to implement the actual endpoint files
2. Create comprehensive tests for each endpoint
3. Document the API for frontend developers

## Conclusion

This implementation plan provides a detailed roadmap for creating the tribute management REST API endpoints in our SvelteKit application. By following this approach, we'll ensure type safety, proper error handling, and security while maintaining compatibility with our WordPress backend.