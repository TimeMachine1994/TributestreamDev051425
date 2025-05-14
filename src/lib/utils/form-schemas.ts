import { z } from 'zod';

// Login form schema (my-portal)
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required")
});

// Schedule Now form schema
export const scheduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email format"),
  serviceDate: z.string().min(1, "Service date is required"),
  serviceTime: z.string().min(1, "Service time is required"),
  serviceLocation: z.string().optional(),
  attendees: z.string().optional(),
  serviceType: z.string().optional().default("funeral"),
  additionalInfo: z.string().optional(),
  preferredContactMethod: z.string().optional().default("email")
});

// Homepage search form schema
export const searchSchema = z.object({
  searchTerm: z.string().min(1, "Search term is required")
});

// Homepage tribute creator form schema
export const creatorSchema = z.object({
  creatorFullName: z.string().min(1, "Name is required"),
  creatorPhone: z.string().min(1, "Phone number is required"),
  creatorEmail: z.string().email("Invalid email format")
});

// Funeral Director form schema
export const fdFormSchema = z.object({
  // New full name fields that replaced first/last name fields
  "director-name": z.string().min(1, "Director's name is required"),
  "family-member-name": z.string().optional(),
  "loved-one-name": z.string().min(1, "Loved one's name is required"),
  
  // Support for legacy field names in forms
  "director-first-name": z.string().optional(),
  "director-last-name": z.string().optional(),
  "family-member-first-name": z.string().optional(),
  "family-member-last-name": z.string().optional(),
  "family-member-dob": z.string().optional(),
  "deceased-first-name": z.string().optional(),
  "deceased-last-name": z.string().optional(),
  "deceased-dob": z.string().optional(),
  "deceased-dop": z.string().min(1, "Date of passing is required"),
  "email-address": z.string().email("Invalid email format"),
  "phone-number": z.string().min(1, "Phone number is required"),
  "location-name": z.string().min(1, "Location name is required"),
  "location-address": z.string().min(1, "Location address is required"),
  "memorial-time": z.string().min(1, "Memorial time is required"),
  "memorial-date": z.string().min(1, "Memorial date is required")
});

// Portal subscription form schema
export const portalSubscriptionSchema = z.object({
  email: z.string().email("Invalid email format")
});

// Export types for TypeScript usage
export type LoginSchema = typeof loginSchema;
export type ContactSchema = typeof contactSchema;
export type ScheduleSchema = typeof scheduleSchema;
export type SearchSchema = typeof searchSchema;
export type CreatorSchema = typeof creatorSchema;
export type FdFormSchema = typeof fdFormSchema;
export type PortalSubscriptionSchema = typeof portalSubscriptionSchema;