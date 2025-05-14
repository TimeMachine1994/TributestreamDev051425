// src/routes/api/auth/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookie, formatUserData } from '$lib/utils/cookie-auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('🚀 [Auth API] POST request received.');
  
    // Step 1: Parse incoming JSON request
    let username, password;
    try {
        const requestBody = await request.json();
        username = requestBody.username;
        password = requestBody.password;
  
        console.log('📝 [Auth API] Parsed request JSON:');
        console.log('   Username:', username);
        console.log('   Password:', password ? '********' : undefined); // Mask password in logs
    } catch (error) {
        console.error('❌ [Auth API] Error parsing request JSON:', error);
        return json({ message: 'Invalid request payload' }, { status: 400 });
    }
  
    // Step 2: Validate credentials presence
    if (!username || !password) {
        console.warn('⚠️ [Auth API] Missing username or password.');
        return json({ message: 'Username and password are required' }, { status: 400 });
    }
  
    // Step 3: Make request to WordPress JWT endpoint
    console.log('🔄 [Auth API] Sending request to WordPress JWT endpoint...');
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
  
        console.log('🛬 [Auth API] Received response from WordPress:');
        console.log('   Status Code:', response.status);
  
        // Step 4: Parse WordPress response
        const data = await response.json();
        console.log('📝 [Auth API] Parsed response JSON from WordPress:');
        console.log('   Response Data:', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Truncate large objects
        
        if (data.roles) {
            console.log('   User Roles:', data.roles);
        }
        
        if (data.capabilities) {
            console.log('   User Capabilities:', Object.keys(data.capabilities).join(', '));
        }
  
        // Step 5: Handle non-OK responses
        if (!response.ok) {
            console.error('❌ [Auth API] WordPress returned an error:');
            console.error('   Message:', data.message);
            return json({ message: data.message || 'Authentication failed' }, { status: response.status });
        }
  
        // Step 6: Set auth cookies and return successful response
        console.log('✅ [Auth API] Authentication successful. Setting cookies and returning user info...');
        
        // Format user data
        const userData = formatUserData(data);
        
        // Set auth cookies
        setAuthCookie(cookies, data.token, userData);
        
        // Return success response (without token since it's now in the cookie)
        return json({
            success: true,
            user: userData
        }, { status: 200 });
    } catch (error) {
        console.error('🚨 [Auth API] Error occurred while authenticating with WordPress:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}