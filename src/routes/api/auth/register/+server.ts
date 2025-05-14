import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Registration API endpoint handler
 * Receives registration data and forwards to WordPress backend
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
    console.log('🚀 [Register API] POST request received.');
    
    // Parse and validate input
    try {
        const requestBody = await request.json();
        const { username, email, password } = requestBody;
        
        // Basic validation
        if (!username || !email || !password) {
            return json({ 
                success: false,
                message: 'Username, email, and password are required' 
            }, { status: 400 });
        }
        
        if (!isValidEmail(email)) {
            return json({ 
                success: false,
                message: 'Invalid email format' 
            }, { status: 400 });
        }
        
        // Forward to WordPress registration endpoint
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ [Register API] Registration failed:', data);
            return json({ 
                success: false,
                message: data.message || 'Registration failed' 
            }, { status: response.status });
        }
        
        console.log('✅ [Register API] Registration successful');
        return json({
            success: true,
            user_id: data.user_id,
            user_email: data.user_email,
            user_display_name: data.user_display_name
        }, { status: 200 });
    } catch (error) {
        console.error('🚨 [Register API] Error:', error);
        return json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
};

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns boolean indicating if email format is valid
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}