import jwt from 'jsonwebtoken';

const TOKEN_NAME = process.env.PUBLIC_AUTH_TOKEN_NAME || 'auth_token';
const TOKEN_EXPIRY = process.env.PUBLIC_AUTH_TOKEN_EXPIRY || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

export interface AuthTokenPayload {
	id: number;
	email: string;
	role: string;
}

export function signJwt(payload: AuthTokenPayload): string {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: TOKEN_EXPIRY
	});
}

export function verifyJwt(token: string): AuthTokenPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
	} catch (err) {
		console.error('❌ Invalid JWT:', err);
		return null;
	}
}

export function getTokenName(): string {
	return TOKEN_NAME;
}