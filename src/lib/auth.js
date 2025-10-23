import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Minimal auth utilities for issuing and verifying JWTs and handling passwords

function getJwtSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not set. Define it in .env.local');
	}
	return secret;
}

export function signJwt(payload, options = {}) {
	const secret = getJwtSecret();
	const { expiresIn = '2h' } = options;
	return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt(token) {
	const secret = getJwtSecret();
	try {
 		return jwt.verify(token, secret);
 	} catch {
 		return null;
 	}
}

export async function hashPassword(plain) {
	const saltRounds = 10;
	return await bcrypt.hash(plain, saltRounds);
}

export async function verifyPassword(plain, hashed) {
 	try {
 		return await bcrypt.compare(plain, hashed);
 	} catch {
 		return false;
 	}
}



