/**
 * Type definitions for tribute management
 */

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