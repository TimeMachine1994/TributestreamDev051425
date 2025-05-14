/**
 * Type definitions for WordPress entities
 */

/**
 * Base interface for WordPress entities
 */
export interface WPEntity {
  id: number;
  date?: string;
  modified?: string;
  slug?: string;
  status?: string;
  link?: string;
}

/**
 * WordPress Post entity
 */
export interface Post extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  author: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
}

/**
 * WordPress Page entity
 */
export interface Page extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  parent?: number;
  menu_order?: number;
  template?: string;
}

/**
 * Tribute custom post type
 */
export interface Tribute extends WPEntity {
  user_id: number;
  loved_one_name: string;
  phone_number: string;
  custom_html?: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
}

/**
 * WordPress User entity
 */
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  capabilities: Record<string, boolean>;
}

/**
 * Authentication response from WordPress JWT
 */
export interface AuthResponse {
  token: string;
  user_id: number;
  user_display_name: string;
  user_email: string;
  user_nicename: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  meta_result: any;
  message?: string; // Error message when authentication fails
}