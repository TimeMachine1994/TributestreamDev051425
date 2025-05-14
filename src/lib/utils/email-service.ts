import sgMail from '@sendgrid/mail';

/**
 * Interface for common email options
 */
// We're implementing our own email sending functions directly

/**
 * Interface for customer confirmation email data
 */
interface CustomerEmailData {
  familyLastName: string;
  tributeLink: string;
  isDuplicate?: boolean;
}

/**
 * Interface for form data (all fields from the memorial form)
 */
interface FormData {
  // New full name fields
  "director-name"?: string;
  "family-member-name"?: string;
  "loved-one-name"?: string;
  
  // Old field names for backwards compatibility
  directorFirstName?: string;
  directorLastName?: string;
  familyMemberFirstName?: string;
  familyMemberLastName?: string;
  familyMemberDOB?: string;
  deceasedFirstName?: string;
  deceasedLastName?: string;
  deceasedDOB?: string;
  deceasedDOP?: string;
  email?: string;
  phone?: string;
  locationName?: string;
  locationAddress?: string;
  memorialTime?: string;
  memorialDate?: string;
  slug?: string;
  password?: string;
  // Type-safe index signature for additional fields
  [key: string]: string | number | boolean | Date | null | undefined;
}

// Import environment variables in SvelteKit using the proper module
import { SENDGRID_API_KEY } from '$env/static/private';

// Initialize SendGrid with the API key from environment variables
// Log SendGrid API key status (without revealing the actual key)
console.log('📧 Initializing SendGrid with API key:',
  SENDGRID_API_KEY ? (SENDGRID_API_KEY.substring(0, 10) + '...[REDACTED]') : 'MISSING API KEY');

if (!SENDGRID_API_KEY) {
  console.error('⚠️ WARNING: SendGrid API key is missing or empty. Email functionality will not work.');
} else {
  console.log('✅ SendGrid API key is configured');
}

// Set the API key for SendGrid
sgMail.setApiKey(SENDGRID_API_KEY || 'SG.dummy-key-for-development');

// Verify SendGrid configuration on startup
(async () => {
  try {
    // We don't actually send an email here, just log that the configuration is ready
    console.log('✅ SendGrid client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing SendGrid client:', error);
  }
})();

/**
 * Send a confirmation email to the customer
 * @param to Customer email address
 * @param data Personalization data
 * @returns Promise resolving to success status
 */
export async function sendCustomerConfirmation(to: string, data: CustomerEmailData): Promise<boolean> {
  try {
    console.log('📧 Sending customer confirmation email to:', to);
    console.log('📧 Customer email data:', JSON.stringify(data, null, 2));
    console.log('📧 Using SendGrid API key:', SENDGRID_API_KEY ? 'Configured ✅' : 'Missing ❌');
    
    const html = createCustomerEmailTemplate(data);
    const text = createCustomerEmailText(data);
    
    await sgMail.send({
      from: 'tributestream@tributestream.com',
      to,
      subject: 'Your Tributestream Memorial Service',
      html,
      text
    });
    
    console.log('✅ Customer confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ SendGrid API error details:', error);
    console.error('❌ Failed to send customer confirmation email:', error);
    return false;
  }
}

/**
 * Send internal notification email with all form data
 * @param formData Complete form submission data
 * @returns Promise resolving to success status
 */
export async function sendInternalNotification(
  formData: FormData
): Promise<boolean> {
  try {
    console.log('📧 Sending internal notification email to tributestream@tributestream.com');
    const html = createInternalNotificationTemplate(formData);
    
    await sgMail.send({
      from: 'tributestream@tributestream.com',
      to: 'tributestream@tributestream.com',
      subject: 'New Memorial Service Form Submission',
      html
    });
    
    console.log('✅ Internal notification email sent successfully to tributestream@tributestream.com');
    return true;
  } catch (error) {
    console.error('❌ SendGrid API error details:', error);
    console.error('❌ Failed to send internal notification email to tributestream@tributestream.com:', error);
    return false;
  }
}



/**
 * Create HTML template for customer confirmation email
 */
function createCustomerEmailTemplate(data: CustomerEmailData): string {
  // Check if this is a duplicate user
  if (data.isDuplicate) {
    // Template for duplicate users (no link, mention 24-hour timeframe)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
          
          body {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 0;
            background-color: #f7f7f7;
          }
          .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            margin: 25px;
          }
          .header {
            background: #1A1A1A;
            color: #D4AF37;
            padding: 35px 30px;
            text-align: center;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 600;
            font-size: 28px;
            letter-spacing: 1px;
            border-bottom: 3px solid #D4AF37;
          }
          .content {
            padding: 35px 30px;
            color: #2A2A2A;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            padding: 25px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eaeaea;
            background-color: #FCFAF5;
          }
          p {
            margin-bottom: 18px;
            color: #333;
            font-size: 15px;
            line-height: 1.7;
          }
          .greeting {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px;
            font-weight: 600;
            color: #1A1A1A;
            margin-bottom: 24px;
          }
          .signature {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 500;
            font-size: 17px;
            color: #1A1A1A;
            margin-top: 30px;
          }
          .company-name {
            font-weight: 600;
            color: #D4AF37;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent);
            width: 60%;
            margin: 30px auto;
          }
          .notice {
            background-color: #FCFAF5;
            border-left: 4px solid #D4AF37;
            padding: 15px 20px;
            border-radius: 4px;
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            Tributestream
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${data.familyLastName} Family,</p>
            
            <p>Tributestream wishes you our deepest sympathy for the passing of your loved one.
            We hope that our service to share the coming memorial will bring greater comfort during this difficult time.</p>
            
            <div class="divider"></div>
            
            <div class="notice">
              <p><strong>We notice that you already have an account with us.</strong> We will send you a sample link within 24 hours.</p>
            </div>
            
            <p>A member of our team will be in touch within 24-48 hours to assist you with any questions or special arrangements.</p>
            
            <p>We look forward to meeting you and offering our personal condolences.</p>
            
            <div class="signature">
              Respectfully,<br>
              <span class="company-name">Tributestream</span>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Regular template for new users (with link)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 650px;
          margin: 0 auto;
          padding: 0;
          background-color: #f7f7f7;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          margin: 25px;
        }
        .header {
          background: #1A1A1A;
          color: #D4AF37;
          padding: 35px 30px;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 28px;
          letter-spacing: 1px;
          border-bottom: 3px solid #D4AF37;
        }
        .content {
          padding: 35px 30px;
          color: #2A2A2A;
        }
        .footer {
          text-align: center;
          margin-top: 25px;
          padding: 25px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eaeaea;
          background-color: #FCFAF5;
        }
        .button {
          display: inline-block;
          background-color: #D4AF37;
          color: #1A1A1A;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          margin: 25px 0;
          font-weight: 500;
          font-size: 15px;
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.25);
          transition: all 0.3s ease;
          border: 1px solid #D4AF37;
          letter-spacing: 0.5px;
        }
        .button:hover {
          background-color: #E6C346;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(212, 175, 55, 0.3);
        }
        p {
          margin-bottom: 18px;
          color: #333;
          font-size: 15px;
          line-height: 1.7;
        }
        .greeting {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A1A1A;
          margin-bottom: 24px;
        }
        .cta-container {
          text-align: center;
          margin: 35px 0;
          padding: 15px 0;
          background-color: #FCFAF5;
          border-radius: 8px;
        }
        .signature {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: 17px;
          color: #1A1A1A;
          margin-top: 30px;
        }
        .company-name {
          font-weight: 600;
          color: #D4AF37;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent);
          width: 60%;
          margin: 30px auto;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          Tributestream
        </div>
        
        <div class="content">
          <p class="greeting">Dear ${data.familyLastName} Family,</p>
          
          <p>Tributestream wishes you our deepest sympathy for the passing of your loved one.
          We hope that our service to share the coming memorial will bring greater comfort during this difficult time.</p>
          
          <div class="divider"></div>
          
          <p>Please follow the link below to complete the process. You will receive a confirmation and a shareable link to the website page that will broadcast the stream:</p>
          
          <div class="cta-container">
            <a href="${data.tributeLink}" class="button">View Memorial Page</a>
          </div>
          
          <p>A member of our team will be in touch within 24-48 hours to assist you with any questions or special arrangements.</p>
          
          <p>We look forward to meeting you and offering our personal condolences.</p>
          
          <div class="signature">
            Respectfully,<br>
            <span class="company-name">Tributestream</span>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tributestream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text version of customer email for clients that don't support HTML
 */
function createCustomerEmailText(data: CustomerEmailData): string {
  // Check if this is a duplicate user
  if (data.isDuplicate) {
    // Plain text template for duplicate users (no link)
    return `
TRIBUTESTREAM
============

Dear ${data.familyLastName} Family,

Tributestream wishes you our deepest sympathy for the passing of your loved one.
We hope that our service to share the coming memorial will bring greater comfort during this difficult time.

------------------------

We notice that you already have an account with us. We will send you a sample link within 24 hours.

A member of our team will be in touch within 24-48 hours to assist you with any questions or special arrangements.

We look forward to meeting you and offering our personal condolences.

Respectfully,
Tributestream

============
© ${new Date().getFullYear()} Tributestream. All rights reserved.
  `;
  }
  
  // Regular plain text template for new users (with link)
  return `
TRIBUTESTREAM
============

Dear ${data.familyLastName} Family,

Tributestream wishes you our deepest sympathy for the passing of your loved one.
We hope that our service to share the coming memorial will bring greater comfort during this difficult time.

------------------------

Please follow the link below to complete the process. You will receive a confirmation
and a shareable link to the website page that will broadcast the stream:

Memorial Page: ${data.tributeLink}

A member of our team will be in touch within 24-48 hours to assist you with any questions or special arrangements.

We look forward to meeting you and offering our personal condolences.

Respectfully,
Tributestream

============
© ${new Date().getFullYear()} Tributestream. All rights reserved.
  `;
}

/**
 * Create HTML template for internal notification email with all form data
 */
function createInternalNotificationTemplate(formData: FormData): string {
  // Convert form data to HTML table rows
  const formDataRows = Object.entries(formData)
    .map(([key, value]) => {
      if (key === 'password') {
        // Don't include the password in the email for security
        return '';
      }
      
      // Format the key by converting camelCase to Title Case with spaces
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();
      
      return `
        <tr>
          <td style="padding: 14px; border-bottom: 1px solid #eaeaea; font-weight: 500; color: #1A1A1A; font-family: 'Montserrat', sans-serif; background-color: #FCFAF5;">${formattedKey}</td>
          <td style="padding: 14px; border-bottom: 1px solid #eaeaea; color: #333; font-family: 'Montserrat', sans-serif;">${value}</td>
        </tr>
      `;
    })
    .filter(row => row !== '') // Remove empty rows (like password)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
          background-color: #f7f7f7;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          margin: 25px;
        }
        .header {
          background: #1A1A1A;
          color: #D4AF37;
          padding: 35px 30px;
          text-align: center;
          border-bottom: 3px solid #D4AF37;
        }
        .header h2 {
          font-family: 'Cormorant Garamond', serif;
          margin: 0 0 10px 0;
          font-weight: 600;
          font-size: 28px;
          letter-spacing: 1px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
          color: #ffffff;
        }
        .content {
          padding: 35px 30px;
          color: #2A2A2A;
        }
        .footer {
          text-align: center;
          margin-top: 25px;
          padding: 25px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eaeaea;
          background-color: #FCFAF5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        table thead th {
          background-color: #1A1A1A;
          padding: 14px;
          font-weight: 600;
          text-align: left;
          color: #D4AF37;
          border-bottom: 1px solid #D4AF37;
        }
        .note {
          margin-top: 30px;
          padding: 20px;
          background-color: #FCFAF5;
          border-left: 4px solid #D4AF37;
          border-radius: 8px;
          font-size: 15px;
        }
        .intro {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          margin-bottom: 24px;
          color: #1A1A1A;
          font-weight: 500;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent);
          width: 60%;
          margin: 30px auto;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>New Memorial Service Form Submission</h2>
          <p>Received on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
          <p class="intro">A new memorial service form has been submitted with the following information:</p>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${formDataRows}
            </tbody>
          </table>
          
          <div class="note">
            <strong style="color: #1A1A1A; font-family: 'Cormorant Garamond', serif;">Important:</strong> Please review this information and follow up with the family within 24-48 hours as per protocol.
          </div>
          
          <div class="divider"></div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} <span style="color: #D4AF37; font-weight: 500;">Tributestream</span>. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}