import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

const STRAPI_BASE_URL = env.STRAPI_API_URL; // e.g., http://localhost:1337 or your production URL

interface StrapiErrorDetail {
  path: string[];
  message: string;
  name: string;
}

interface StrapiError {
  status: number;
  name: string;
  message: string;
  details: Record<string, unknown> | StrapiErrorDetail[];
}

interface StrapiErrorResponse {
  data: null;
  error: StrapiError;
}


interface FetchOptions extends RequestInit {
  token?: string;
}

async function strapiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {},
  event?: RequestEvent // Optional: if JWT needs to be sourced from cookies for this specific call
): Promise<T> {
  const headers = new Headers(options.headers);
  // Set default Content-Type if not already provided by options.headers
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let token = options.token;

  // If an event is provided and no explicit token, try to get JWT from cookies
  if (!token && event) {
    token = event.cookies.get('jwt');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure endpoint starts with a slash and STRAPI_BASE_URL does not end with one
  const cleanBaseUrl = STRAPI_BASE_URL.endsWith('/') ? STRAPI_BASE_URL.slice(0, -1) : STRAPI_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}${cleanEndpoint}` : `${cleanBaseUrl}/api${cleanEndpoint}`; // Strapi v4/v5 typically prefixes API routes with /api

  console.log(`🚀 Strapi Fetch: ${options.method || 'GET'} ${url}`);
  console.log('Strapi Request Headers:', JSON.stringify(Object.fromEntries(headers.entries())));
  if (options.body) {
    // Avoid logging sensitive data in production if body might contain it
    // console.log(`Payload: ${options.body}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: StrapiErrorResponse | { error: { message: string, status: number, details?: any } };
      const responseText = await response.text(); // Get raw text first
      console.error(`❌ Strapi API Raw Error Response Text for ${url}: ${responseText}`); // Log raw text

      try {
        errorBody = JSON.parse(responseText); // Try to parse the logged text
      } catch (e) {
        // If parsing JSON fails, create a generic error structure
        errorBody = {
          error: {
            message: response.statusText || 'Unknown Strapi API error (raw text not JSON)',
            status: response.status,
            details: { rawResponse: responseText.substring(0, 1000) } // Include raw response snippet
          }
        };
      }
      
      const errorMessage = errorBody.error?.message || 'Unknown error from Strapi';
      const errorStatus = errorBody.error?.status || response.status;
      const errorDetails = errorBody.error?.details || {};

      console.error(`❌ Strapi API Error (${errorStatus}) on ${options.method || 'GET'} ${url}: ${errorMessage}`, errorDetails);
      
      // Throw an error object that matches the structure your app might expect
      // or a more generic one.
      const errorToThrow = new Error(errorMessage) as any;
      errorToThrow.status = errorStatus;
      errorToThrow.details = errorDetails;
      if ((errorBody as StrapiErrorResponse).error?.name) {
        errorToThrow.name = (errorBody as StrapiErrorResponse).error.name;
      }
      throw errorToThrow;
    }

    if (response.status === 204) { // No Content
      console.log(`✅ Strapi Fetch Success (204 No Content): ${options.method || 'GET'} ${url}`);
      return null as T; // Or an appropriate representation for "no content"
    }

    const responseData = await response.json();
    console.log(`✅ Strapi Fetch Success (${response.status}): ${options.method || 'GET'} ${url}`);
    return responseData as T;

  } catch (error: any) {
    // Catch errors from fetch itself (network errors) or re-thrown errors from !response.ok
    if (!error.status) { // Likely a network error or an error not from the API response handling
        console.error(`🕸️ Network or other error calling Strapi API on ${options.method || 'GET'} ${url}:`, error.message);
    }
    // Re-throw the error so the calling function can handle it
    throw error;
  }
}

export { strapiFetch, STRAPI_BASE_URL };
export type { StrapiError, StrapiErrorResponse, StrapiErrorDetail };
