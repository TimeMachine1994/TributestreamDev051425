/**
 * TODO: Remove this file once Strapi-based registration is implemented.
 * WordPress User Registration Service (DISABLED)
 */

/*
interface RegistrationResult {
    success: boolean;
    message: string;
    isDuplicate?: boolean; // Flag for specific duplicate error
    userId?: number; // WordPress User ID if successful
}

interface UserData {
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string; // Optional, will be generated if not provided
    password?: string; // Optional, will be generated if not provided
}

export async function registerWordPressUser(userData: UserData): Promise<RegistrationResult> {
    console.log(`🏁 Attempting to register user in WordPress: ${userData.email}`);

    // Generate username if not provided (email prefix + random string)
    const username = userData.username || 
        userData.email.split('@')[0] + Math.random().toString(36).substring(2, 7);
    
    // Generate random password if not provided
    const password = userData.password || 
        Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    try {
        // Use the existing registration endpoint
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: userData.email,
                password,
                firstName: userData.firstName || '',
                lastName: userData.lastName || ''
            })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log(`✅ WordPress user registration successful for ${userData.email}`);
            return {
                success: true,
                message: 'User registered successfully.',
                userId: responseData.user_id
            };
        } else {
            console.warn(`❌ WordPress user registration failed for ${userData.email}. Status: ${response.status}`);
            return {
                success: false,
                message: `User with username derived from ${userData.email} already exists.`,
                isDuplicate: true
            };
        }
    } catch (error: any) {
        console.error(`💥 Error during WordPress user registration for ${userData.email}:`, error);
        return {
            success: false,
            message: `Registration failed due to error: ${error.message}`
        };
    }
}
*/