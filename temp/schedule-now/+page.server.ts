import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { scheduleSchema } from '$lib/utils/form-schemas';

// Helper function to generate a slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

export const load: PageServerLoad = async () => {
  // Create default data
  const defaultData = {
    name: "John Doe",
    email: "test@example.com",
    phone: "555-123-4567",
    serviceDate: new Date().toISOString().split('T')[0], // Today's date
    serviceTime: "14:00", // 2:00 PM
    serviceLocation: "Memorial Chapel",
    serviceType: "memorial",
    preferredContactMethod: "email",
    attendees: "50",
    additionalInfo: "This is a test submission."
  };
  
  console.log('Default data:', defaultData);
  
  // Initialize the form with default values
  const form = await superValidate(defaultData, zod(scheduleSchema));
  
  // Debug: Check if the form is valid with our default data
  console.log('Is form valid with default data?', form.valid);
  if (!form.valid) {
    console.log('Validation errors with default data:', form.errors);
  }
  
  // Debug: Log the form data being sent to the client
  console.log('Form data being sent to client:', form);
  return { form };
};

export const actions = {
  submit: async ({ request, fetch }) => {
    console.log('🚀 Starting schedule-now form action.');
    console.log('⏱️ Timestamp:', new Date().toISOString());
    
    try {
      // Get the form data
      const rawFormData = await request.formData();
      const formDataObj = Object.fromEntries(rawFormData.entries());
      console.log('📦 Raw form data received:', formDataObj);
      
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      const form = await superValidate(rawFormData, zod(scheduleSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { form });
      }
      
      // Step 3: Prepare email data
      console.log('📧 Preparing email data...');
      
      // Generate a slug from the name for the tribute link
      const nameSlug = generateSlug(form.data.name);
      console.log('🔗 Generated slug from name:', nameSlug);
      
      const emailData = {
        // Format the data for both customer and internal emails
        name: form.data.name,
        email: form.data.email,
        phone: form.data.phone,
        serviceDetails: {
          date: form.data.serviceDate,
          time: form.data.serviceTime,
          location: form.data.serviceLocation || 'Not provided',
          type: form.data.serviceType || 'Not provided'
        },
        attendees: form.data.attendees || 'Not specified',
        additionalInfo: form.data.additionalInfo || 'None',
        preferredContactMethod: form.data.preferredContactMethod || 'Email',
        submissionDate: new Date().toISOString(),
        // Add the generated slug
        slug: nameSlug
      };
      
      // Step 4: Send emails using the email API
      console.log('📤 Sending emails...');
      console.log('📧 Email data being sent:', JSON.stringify(emailData, null, 2));
      console.log('📧 Recipient email:', form.data.email);
      console.log('📧 Admin notification email: tributestream@tributestream.com');
      
      try {
        // Extract last name from full name for email template
        const familyLastName = form.data.name.split(' ').pop() || 'Client';
        
        // Create a comprehensive formData object with all relevant information
        const emailFormData = {
          // Contact information
          name: form.data.name,
          email: form.data.email,
          phone: form.data.phone,
          
          // Service details
          serviceDate: form.data.serviceDate,
          serviceTime: form.data.serviceTime,
          serviceLocation: form.data.serviceLocation || 'Not provided',
          serviceType: form.data.serviceType || 'Not provided',
          
          // Additional information
          attendees: form.data.attendees || 'Not specified',
          additionalInfo: form.data.additionalInfo || 'None',
          preferredContactMethod: form.data.preferredContactMethod || 'Email',
          
          // Metadata
          submissionDate: new Date().toISOString(),
          
          // These fields are expected by the email service
          familyMemberLastName: familyLastName,
          slug: nameSlug
        };
        
        // Send both emails using the API endpoint with dual email functionality
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'dual',
            formData: emailFormData
          })
        });
        
        if (!emailResponse.ok) {
          throw new Error(`Email API responded with status: ${emailResponse.status}`);
        }
        
        const emailResult = await emailResponse.json();
        
        if (!emailResult.success) {
          throw new Error(`Email API returned success: false - ${emailResult.message || 'Unknown error'}`);
        }
        
        console.log('📬 Email API response:', JSON.stringify(emailResult, null, 2));
        console.log('✅ Emails sent successfully');
        
        // Return success response with a detailed message
        return message(
          form,
          'Your consultation request has been sent successfully! We\'ll be in touch within 24 hours to discuss your livestreaming needs.'
        );
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        console.error('❌ Error details:', JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2));
        return message(form, 'Failed to send confirmation email. Please try again or contact us directly at (407) 221-5922.');
      }
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
      
      // Return a user-friendly error message
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again or contact us directly at (407) 221-5922.',
        formData: {}
      });
    }
  }
} satisfies Actions;