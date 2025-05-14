/**
 * Validation Logic for WordPress Models
 * 
 * This module provides validation functions for different model types.
 */

import type { Post, Page, Tribute, User } from '$lib/types/wp-models';

// Define interfaces for validation rules
interface BaseValidationRule {
  required: boolean;
  message: string;
}

interface PatternValidationRule extends BaseValidationRule {
  pattern: RegExp;
  patternMessage: string;
}

type ValidationRule = BaseValidationRule | PatternValidationRule;

// Type guard to check if a rule has a pattern
function hasPattern(rule: ValidationRule): rule is PatternValidationRule {
  return 'pattern' in rule;
}

// Define validation rules for each model type
type ValidationRules = Record<string, Record<string, ValidationRule>>;
const validationRules = {
  PostModel: {
    title: {
      required: true,
      message: 'Title is required'
    },
    content: {
      required: true,
      message: 'Content is required'
    }
  },
  PageModel: {
    title: {
      required: true,
      message: 'Title is required'
    },
    content: {
      required: true,
      message: 'Content is required'
    }
  },
  TributeModel: {
    loved_one_name: {
      required: true,
      message: "Loved one's name is required"
    },
    phone_number: {
      required: true,
      message: 'Phone number is required',
      pattern: /^\d{3}-\d{3}-\d{4}$/,
      patternMessage: 'Phone number must be in the format 123-456-7890'
    }
  },
  UserModel: {
    username: {
      required: true,
      message: 'Username is required'
    },
    email: {
      required: true,
      message: 'Email is required',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Email must be a valid email address'
    }
  }
};

/**
 * Validate a model against its validation rules
 * 
 * @param modelType The type of model to validate
 * @param attributes The attributes to validate
 * @returns An error message if validation fails, null otherwise
 */
export function validateModel(modelType: string, attributes: any): string | null {
  // Get the validation rules for the model type
  const rules = validationRules[modelType as keyof typeof validationRules];
  if (!rules) {
    return null; // No validation rules for this model type
  }
  
  // Check each validation rule
  for (const [field, rule] of Object.entries(rules)) {
    const value = attributes[field];
    
    // Check if the field is required
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message;
    }
    
    // Check if the field matches the pattern
    if (hasPattern(rule) && value && !rule.pattern.test(value)) {
      return rule.patternMessage || rule.message;
    }
  }
  
  return null; // Validation passed
}

/**
 * Format validation errors for display
 * 
 * @param errors An object containing validation errors
 * @returns A formatted error message
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('\n');
}

/**
 * Validate a Post model
 * 
 * @param post The post to validate
 * @returns An object containing validation errors, or null if validation passes
 */
export function validatePost(post: Partial<Post>): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  if (!post.title || !post.title.rendered) {
    errors.title = 'Title is required';
  }
  
  if (!post.content || !post.content.rendered) {
    errors.content = 'Content is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate a Page model
 * 
 * @param page The page to validate
 * @returns An object containing validation errors, or null if validation passes
 */
export function validatePage(page: Partial<Page>): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  if (!page.title || !page.title.rendered) {
    errors.title = 'Title is required';
  }
  
  if (!page.content || !page.content.rendered) {
    errors.content = 'Content is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate a Tribute model
 * 
 * @param tribute The tribute to validate
 * @returns An object containing validation errors, or null if validation passes
 */
export function validateTribute(tribute: Partial<Tribute>): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  if (!tribute.loved_one_name) {
    errors.loved_one_name = "Loved one's name is required";
  }
  
  if (!tribute.phone_number) {
    errors.phone_number = 'Phone number is required';
  } else if (!/^\d{3}-\d{3}-\d{4}$/.test(tribute.phone_number)) {
    errors.phone_number = 'Phone number must be in the format 123-456-7890';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validate a User model
 * 
 * @param user The user to validate
 * @returns An object containing validation errors, or null if validation passes
 */
export function validateUser(user: Partial<User>): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  if (!user.username) {
    errors.username = 'Username is required';
  }
  
  if (!user.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.email = 'Email must be a valid email address';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}