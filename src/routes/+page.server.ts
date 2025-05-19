import { redirect, fail} from '@sveltejs/kit';
import type { Actions } from './$types';
import { generateSecurePassword } from '$lib/utils/auth-helpers';
import { validateSimplifiedMemorialForm } from '$lib/utils/form-validation';
import { createTributeSlug } from '$lib/utils/string-helpers';
import client from '$lib/strapiClient';


export const actions = {
    /**
     * Search action - processes search queries and returns relevant memorial results
     */
    search: async ({ request, fetch }) => {
        console.log('🔍 Processing search request');
        
        try {
            const formData = await request.formData();
            const searchTerm = formData.get('searchTerm');
            
            // Validate search term
            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
                console.warn('⚠️ Empty search term submitted');
                return fail(400, {
                    search: true,
                    error: 'Please enter a search term'
                });
            }
            
            // Call strapi through our proxy
            console.log(`🔍 Searching for: "${searchTerm}"`);
            const response = await fetch(`/api/tributes?search=${encodeURIComponent(searchTerm.trim())}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Search failed:', errorData);
                return fail(response.status, {
                    search: true,
                    error: 'Failed to search memorials',
                    details: errorData.message || 'Unknown error'
                });
            }
            
            const searchResults = await response.json();
            console.log(`✅ Found ${searchResults.tributes?.length || 0} results for "${searchTerm}"`);
            
            return {
                search: true,
                results: searchResults.tributes || [],
                totalItems: searchResults.total_items || 0,
                currentPage: searchResults.current_page || 1,
                totalPages: searchResults.total_pages || 1,
                term: searchTerm
            };
        } catch (error) {
            console.error('🚨 Unexpected error during search:', error);
            return fail(500, {
                search: true,
                error: 'An unexpected error occurred while searching'
            });
        }
    },

    /**
     * Enhanced Create Memorial action - processes the quick memorial creation form
     * with integration to fd-form functionality
     */
    createMemorial: async ({ request, fetch, cookies }) => {
        console.log('🚀 Processing enhanced memorial creation');
        let slug = '';
        
        try {
            const formData = await request.formData();
            
            // Parse form data
            const data = {
                lovedOneName: formData.get('lovedOneName')?.toString() || '',
                creatorFullName: formData.get('creatorFullName')?.toString() || '',
                creatorPhone: formData.get('creatorPhone')?.toString() || '',
                creatorEmail: formData.get('creatorEmail')?.toString() || ''
            };
            
            console.log('📝 Parsed form data:', data);
            
            // Validate form data
            const validation = validateSimplifiedMemorialForm(data);
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                return fail(400, { 
                    create: true,
                    error: true, 
                    message: validation.errors.join('. '),
                    data // Return data for repopulating the form
                });
            }
            
            // Step 1: Generate a secure random password
            console.log('🔐 Generating a secure password');
            const password = generateSecurePassword(16);
            
            // Step 2: Register the user
            console.log('🔄 Registering user');
            const registerResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.creatorEmail,
                    email: data.creatorEmail,
                    password: password,
                    role:  'family-contact' // Assign the family-contact role
                })
            });
            
            // Handle registration errors
            if (!registerResponse.ok) {
                const registerError = await registerResponse.json();
                console.error('❌ Registration failed:', registerError);
                
                // Handle specific error scenarios
                if (registerError.message?.includes('email already exists')) {
                    return fail(400, { 
                        create: true,
                        error: true, 
                        message: 'An account with this email already exists. Please use a different email address or log in.',
                        data
                    });
                }
                
                return fail(registerResponse.status, { 
                    create: true,
                    error: true, 
                    message: registerError.message || 'Registration failed',
                    data
                });
            }
            
            const registerResult = await registerResponse.json();
            const userId = registerResult.user_id;
            console.log('✅ User registered with ID:', userId);
            
            // Step 3: Authenticate the user
            console.log('🔄 Authenticating user');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.creatorEmail,
                    password: password
                })
            });
            
            // Handle authentication errors
            if (!authResponse.ok) {
                const authError = await authResponse.json();
                console.error('❌ Authentication failed:', authError);
                return fail(authResponse.status, { 
                    create: true,
                    error: true, 
                    message: authError.message || 'Authentication failed after registration',
                    data
                });
            }
            
            const authResult = await authResponse.json();
            console.log('✅ User authenticated. JWT token received');
            
            // Step 4: Store the JWT token in cookies
            console.log('🔐 Storing authentication tokens');
            cookies.set('jwt', authResult.token, { 
                httpOnly: true, 
                secure: true, 
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days 
            });
            
            // Also store user data in cookie for client-side access
            cookies.set('user', JSON.stringify({
                id: userId,
                name: data.creatorEmail.split('@')[0], // Simple display name from email
                email: data.creatorEmail
            }), {
                httpOnly: false, // Client accessible
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            
 
             // Step 6: Create the tribute record
            console.log('🚀 Creating tribute');
            
            // Generate the slug
            slug = createTributeSlug(data.lovedOneName);
            
            // Prepare the tribute payload with enhanced HTML
            const tributePayload = {
                loved_one_name: data.lovedOneName,
                slug,
                user_id: userId,
                phone_number: data.creatorPhone || '000-000-0000',
                // Enhanced HTML for better display
                custom_html: `
                    <div class="tribute-header">
                        <h1 class="tribute-title">In Loving Memory of ${data.lovedOneName}</h1>
                        <p class="tribute-creator">Created by ${data.creatorFullName}</p>
                    </div>
                    <div class="tribute-message">
                        <p>This memorial page has been created to honor and celebrate the life of ${data.lovedOneName}.</p>
                    </div>
                `
            };
            
            console.log('📦 Sending enhanced tribute payload');
            
            const tributeResponse = await fech //creat etribute with strapi
            
            // Handle tribute creation errors
            if (!tributeResponse.ok) {
                const tributeError = await tributeResponse.json();
                console.error('❌ Tribute creation failed:', tributeError);
                return fail(tributeResponse.status, { 
                    create: true,
                    error: true, 
                    message: tributeError.message || 'Failed to create memorial page',
                    data
                });
            }
            
            const tributeResult = await tributeResponse.json();
            console.log('✅ Tribute created successfully:', tributeResult);
            
            // Step 7: Send welcome email with enhanced template
            try {
                console.log('📧 Sending welcome email with credentials');
                
                // Create comprehensive emailFormData for enhanced email
                const emailFormData = {
                    // Deceased information
                    deceasedFirstName: firstName,
                    deceasedLastName: lastName,
                    deceasedFullName: data.lovedOneName,
                    
                    // Creator information
                    directorFirstName: creatorFirstName,
                    directorLastName: creatorLastName,
                    directorFullName: data.creatorFullName,
                    
                    // Contact information
                    email: data.creatorEmail,
                    phone: data.creatorPhone,
                    
                    // Account information
                    username: data.creatorEmail,
                    password: password,
                    
                    // Generated tribute information
                    slug: slug,
                    tributeLink: `https://tributestream.com/celebration-of-life-for-${slug}`
                };
                
                // Send enhanced dual email using the more comprehensive endpoint
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'memorial_creation',
                        formData: emailFormData
                    })
                });
                
                const emailResult = await emailResponse.json();
                if (emailResult.success) {
                    console.log('✅ Emails sent successfully');
                } else {
                    console.warn('⚠️ Email sending partial success or failure:', emailResult);
                }
            } catch (emailError) {
                console.warn('⚠️ Email notification failed, but process continues:', emailError);
                
                // Fallback to simple email if enhanced email fails
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            to: data.creatorEmail,
                            subject: 'Your Tributestream Memorial',
                            html: `
                                <h2>Your Memorial for ${data.lovedOneName} Has Been Created</h2>
                                <p>Thank you for using Tributestream to honor your loved one.</p>
                                <p>Your account has been created with the following credentials:</p>
                                <p><strong>Username:</strong> ${data.creatorEmail}</p>
                                <p><strong>Password:</strong> ${password}</p>
                                <p>Your memorial page is now available at: https://tributestream.com/celebration-of-life-for-${slug}</p>
                            `
                        })
                    });
                } catch (fallbackError) {
                    console.warn('⚠️ Fallback email also failed:', fallbackError);
                }
            }
            
        } catch (error) {
            // Check for SvelteKit redirect objects
            if (error instanceof Error && 'status' in error && 'location' in error) {
                throw error; // Re-throw redirects
            }
            
            console.error('💥 Unexpected error during memorial creation:', error);
            return fail(500, { 
                create: true,
                error: true, 
                message: 'An unexpected error occurred. Please try again.' 
            });
        }
        
        // Step 7: Redirect to the newly created tribute page
        console.log('🔀 Redirecting to created memorial page');
        throw redirect(303, `/celebration-of-life-for-${slug}`);
    }
} satisfies Actions;