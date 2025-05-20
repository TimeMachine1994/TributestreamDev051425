// import nodemailer from 'nodemailer';

export interface ConfirmationEmailParams {
	recipientEmail: string;
	recipientName: string;
	tributeName: string;
}

export interface EmailSendResult {
	success: boolean;
	error?: string;
}

export async function sendConfirmationEmail({
	recipientEmail,
	recipientName,
	tributeName
}: ConfirmationEmailParams): Promise<EmailSendResult> {
	console.log('📧 Preparing to send confirmation email to:', recipientEmail);

	try {
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT) || 587,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});

		const mailOptions = {
			from: process.env.EMAIL_FROM || 'no-reply@example.com',
			to: recipientEmail,
			subject: 'Tribute Submission Confirmation',
			text: `Dear ${recipientName},\n\nThank you for submitting the tribute for ${tributeName}. We have received your submission and will process it shortly.\n\nBest regards,\nThe Tribute Team`,
			html: `<p>Dear ${recipientName},</p><p>Thank you for submitting the tribute for <strong>${tributeName}</strong>. We have received your submission and will process it shortly.</p><p>Best regards,<br/>The Tribute Team</p>`
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('✅ Email sent:', info.messageId);
		return { success: true };
	} catch (error: any) {
		console.error('❌ Failed to send email:', error);
		return { success: false, error: error.message || 'Unknown error' };
	}
}