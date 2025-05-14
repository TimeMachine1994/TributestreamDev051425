/**
 * Interface representing the result of form validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates funeral director form data
 * @param data - The form data to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validateFuneralDirectorForm(data: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields
    if (!data.email) errors.push('Email address is required');
    
    // Check both new and old field names for director
    if (!data['director-name'] && !(data.directorFirstName || data.directorLastName)) {
        errors.push('Director\'s name is required');
    }
    
    // Check both new and old field names for deceased
    if (!data['loved-one-name'] && !(data.deceasedFirstName || data.deceasedLastName)) {
        errors.push('Loved one\'s name is required');
    }
    
    if (!data.phone) errors.push('Phone number is required');
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Invalid phone number format');
    }
    
    // Date validations (if provided)
    if (data.deceasedDOB && !isValidDate(data.deceasedDOB)) {
        errors.push('Invalid deceased date of birth');
    }
    
    if (data.deceasedDOP && !isValidDate(data.deceasedDOP)) {
        errors.push('Invalid deceased date of passing');
    }
    
    if (data.memorialDate && !isValidDate(data.memorialDate)) {
        errors.push('Invalid memorial date');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\(\)\s]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Validates date format
 * @param date - Date string to validate
 * @returns boolean indicating if date is valid
 */
function isValidDate(date: string): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
}

/**
 * Validates simplified memorial creation form data
 * @param data - The memorial form data to validate
 * @returns ValidationResult with validation status and any errors
 */
export function validateSimplifiedMemorialForm(data: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields
    if (!data.lovedOneName) errors.push('Loved one\'s name is required');
    if (!data.creatorFullName) errors.push('Your full name is required');
    if (!data.creatorPhone) errors.push('Phone number is required');
    if (!data.creatorEmail) errors.push('Email address is required');
    
    // Email validation
    if (data.creatorEmail && !isValidEmail(data.creatorEmail)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation
    if (data.creatorPhone && !isValidPhone(data.creatorPhone)) {
        errors.push('Invalid phone number format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
