import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserByEmail, saveResetToken } from '$lib/server/wp-user-service';
import { generateToken } from '$lib/server/auth/jwt';
import { sendEmail } from '$lib/utils/email-service';

export const POST: RequestHandler = async ({ request }) => {
	const { email } = await request.json();

	if (!email) {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const user = await getUserByEmail(email);

	// Always return success to prevent user enumeration
	if (!user) {
		return json({ success: true });
	}

	const token = generateToken({ id: user.id, email: user.email }, '15m');
	await saveResetToken(user.id, token);

	const resetUrl = `${process.env.PUBLIC_BASE_URL}/reset-password?token=${token}`;
	await sendEmail({
		to: user.email,
		subject: 'Reset your password',
		html: `
			<p>You requested a password reset. Click the link below to reset your password:</p>
			<p><a href="${resetUrl}">${resetUrl}</a></p>
			<p>This link will expire in 15 minutes.</p>
		`
	});

	return json({ success: true });
};