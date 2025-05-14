import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  sendCustomerConfirmation,
  sendInternalNotification,
} from '$lib/utils/email-service';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '$env/static/private';

// Ensure SendGrid is initialized
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('📨 Received request to send-email API endpoint');
    const data = await request.json();
    console.log('📦 Request data:', JSON.stringify(data, null, 2));
    
    // Validate request data
    if (!data || typeof data !== 'object') {
      return json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Handle dual email sending (for memorial service forms)
    if (data.type === 'dual' && data.formData) {
      console.log('🔄 Processing dual email request');
      // Extract necessary data from the form data
      const {
        familyMemberLastName,
        email,
        slug,
        isDuplicate
      } = data.formData;

      // Prepare data for customer email
      const customerData = {
        familyLastName: familyMemberLastName || 'Valued',
        tributeLink: slug
          ? `https://tributestream.com/celebration-of-life-for-${slug}`
          : 'https://tributestream.com/celebration-of-life-preview',
        isDuplicate: isDuplicate || false
      };
      
      console.log('👤 Customer email data:', JSON.stringify(customerData, null, 2));

      // Send customer confirmation email
      const customerEmailResult = await sendCustomerConfirmation(
        email,
        customerData
      );
      // Send internal notification with all form data to tributestream@tributestream.com
      const internalEmailResult = await sendInternalNotification(data.formData);
      
      console.log('📊 Email sending results - Customer: ' + (customerEmailResult ? '✅' : '❌') +
                 ', Internal to tributestream@tributestream.com: ' + (internalEmailResult ? '✅' : '❌'));
      
      // Return success if at least one email succeeded
      // This prevents blocking the user flow if one email fails
      if (customerEmailResult || internalEmailResult) {
        return json({
          success: true,
          customerEmailSent: customerEmailResult,
          internalEmailSent: internalEmailResult
        });
      } else {
        // Both emails failed
        return json(
          { success: false, message: 'Failed to send emails' },
          { status: 500 }
        );
      }
    }
    // Handle direct email sending (for contact forms)
    else if (data.to && (data.html || data.text)) {
      console.log('📧 Processing direct email request to:', data.to);
      
      try {
        if (!SENDGRID_API_KEY) {
          throw new Error('SendGrid API key is not configured');
        }
        
        // Send the email using SendGrid
        await sgMail.send({
          from: 'tributestream@tributestream.com',
          to: data.to,
          subject: data.subject || 'Message from Tributestream',
          html: data.html || '',
          text: data.text || ''
        });
        
        console.log('✅ Email sent successfully to:', data.to);
        return json({ success: true });
      } catch (error) {
        console.error('❌ Failed to send email:', error);
        return json(
          { success: false, message: 'Failed to send email' },
          { status: 500 }
        );
      }
    }
    // If we reach here, request didn't match any expected format
    return json(
      { success: false, message: 'Invalid email request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('💥 Top-level error processing API request:', error);
    return json(
      { success: false, message: 'Server error processing request' },
      { status: 500 }
    );
  }
};