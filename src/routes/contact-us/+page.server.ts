import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { contactSchema } from '$lib/utils/form-schemas';
import { PRIVATE_RECAPTCHA } from '$env/static/private';

export const load: PageServerLoad = async () => {
  // Initialize the form with default values
  const form = await superValidate(zod(contactSchema));
  
  return { form };
};

export const actions = {
  sendMessage: async ({ request, fetch }) => {
    console.log('🚀 Starting contact-us form action.');
    
    try {
      // Validate the form data using superValidate
      console.log('📝 Parsing and validating form data...');
      // handle reCAPTCHA verification
      const formData = await request.formData();
      const recaptchaToken = formData.get('g-recaptcha-response')?.toString() ?? '';
      if (!recaptchaToken) {
        const tempForm = await superValidate(formData, zod(contactSchema));
        return message(tempForm, 'Please complete the captcha', { status: 400 });
      }
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: PRIVATE_RECAPTCHA,
          response: recaptchaToken
        })
      });
      const recaptchaResult = await recaptchaResponse.json();
      if (!recaptchaResult.success) {
        const tempForm = await superValidate(formData, zod(contactSchema));
        return message(tempForm, 'Captcha verification failed', { status: 400 });
      }
      // validate form fields
      const form = await superValidate(formData, zod(contactSchema));
      
      // Check if form is valid
      if (!form.valid) {
        console.error('❌ Validation errors:', form.errors);
        return fail(400, { form });
      }
      
      // Step 3: Prepare email data
      console.log('📧 Preparing email data...');
      
      // Prepare user confirmation email content
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Thank You for Contacting Us</h2>
          <p>Dear ${form.data.name},</p>
          <p>Thank you for reaching out to Tributestream. We have received your message and will get back to you as soon as possible.</p>
          <p>Here's a summary of the information you provided:</p>
          <ul>
            <li><strong>Name:</strong> ${form.data.name}</li>
            <li><strong>Email:</strong> ${form.data.email}</li>
            ${form.data.phone ? `<li><strong>Phone:</strong> ${form.data.phone}</li>` : ''}
            <li><strong>Message:</strong> ${form.data.message}</li>
          </ul>
          <p>If you have any additional questions or information to share, please don't hesitate to reply to this email.</p>
          <p>Best regards,</p>
          <p>The Tributestream Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
          </div>
        </div>
      `;
      
      const userEmailText = `
        Thank You for Contacting Us
        
        Dear ${form.data.name},
        
        Thank you for reaching out to Tributestream. We have received your message and will get back to you as soon as possible.
        
        Here's a summary of the information you provided:
        - Name: ${form.data.name}
        - Email: ${form.data.email}
        ${form.data.phone ? `- Phone: ${form.data.phone}` : ''}
        - Message: ${form.data.message}
        
        If you have any additional questions or information to share, please don't hesitate to reply to this email.
        
        Best regards,
        The Tributestream Team
        
        © ${new Date().getFullYear()} Tributestream. All rights reserved.
      `;
      
      // Send confirmation email to the user via API
      console.log('📧 Sending confirmation email to user:', form.data.email);
      const userEmailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: form.data.email,
          subject: 'Thank you for contacting Tributestream',
          html: userEmailHtml,
          text: userEmailText
        })
      });
      
      const userEmailResult = userEmailResponse.ok;
      if (userEmailResult) {
        console.log('✅ User confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send user confirmation email');
      }
      
      // Prepare admin notification email content
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p>A new contact form has been submitted with the following details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Field</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Value</th>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">Name</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${form.data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">Email</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${form.data.email}</td>
            </tr>
            ${form.data.phone ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">Phone</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${form.data.phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">Message</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${form.data.message}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">Submission Date</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please respond to this inquiry as soon as possible.</p>
        </div>
      `;
      
      const adminEmailText = `
        New Contact Form Submission
        
        A new contact form has been submitted with the following details:
        
        Name: ${form.data.name}
        Email: ${form.data.email}
        ${form.data.phone ? `Phone: ${form.data.phone}` : ''}
        Message: ${form.data.message}
        Submission Date: ${new Date().toLocaleString()}
        
        Please respond to this inquiry as soon as possible.
      `;
      
      // Send notification email to the admin via API
      console.log('📧 Sending notification email to admin: tributestream@tributestream.com');
      const adminEmailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'tributestream@tributestream.com',
          subject: 'New Contact Form Submission',
          html: adminEmailHtml,
          text: adminEmailText
        })
      });
      
      const adminEmailResult = adminEmailResponse.ok;
      if (adminEmailResult) {
        console.log('✅ Admin notification email sent successfully');
      } else {
        console.error('❌ Failed to send admin notification email');
      }
      
      // Check if both emails failed to send
      if (!userEmailResult && !adminEmailResult) {
        console.error('❌ Both emails failed to send');
        return message(form, 'Failed to send your message. Please try again or contact us directly.', {
          status: 500
        });
      }
      
      // Log email sending results
      console.log('📊 Email sending results - User: ' + (userEmailResult ? '✅' : '❌') +
                 ', Admin: ' + (adminEmailResult ? '✅' : '❌'));
      
      console.log('✅ Form submission processed successfully');
      
      // Return success response with a message and reset the form
      return message(form, 'Your message has been sent. We will get back to you soon.');
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return fail(500, {
        error: true,
        message: 'An unexpected error occurred. Please try again or contact us directly.',
        formData: {}
      });
    }
  }
} satisfies Actions;