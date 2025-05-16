 
//owner is a strinhg for now but once we finalize the models we can fix it and make it a object
export interface FdFormInput {
    // Director info
    directorName: string;

    // Loved One info
    lovedOneName: string;

    // Family Member info
    familyMemberName: string;

    // Contact info
    email: string;
    phone: string;

    // Memorial info (all optional except memorialDate, if required by you)
    locationName?: string;
    locationAddress?: string;
    memorialDate?: string;        // ISO date string (e.g., "2025-05-10")
    memorialTime?: string;        // ISO time string (e.g., "14:00" or "14:00:00")

}
 
 
/**
 * Custom authentication error types
 */
export interface AuthError {
  code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED';
  message: string;
}
 
// src/lib/server/auth/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role?: {
    id: string;
    name: string;
    type: string;
  };
}

/**
 * Tribute content type
 */
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

/**
 * Funeral Home content type
 */
export interface FuneralHome {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  directors: User[];
}

