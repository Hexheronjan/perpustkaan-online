import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(req) {
	try {
		const { password } = await req.json();
		
		if (!password) {
			return NextResponse.json({ message: 'Password required' }, { status: 400 });
		}
		
		// Hash the password
		const hashedPassword = await hashPassword(password);
		
		// Verify the password
		const isValid = await verifyPassword(password, hashedPassword);
		
		return NextResponse.json({
			success: true,
			originalPassword: password,
			hashedPassword: hashedPassword,
			isValid: isValid
		});
	} catch (error) {
		console.error('Password test error:', error);
		return NextResponse.json({ 
			success: false, 
			message: 'Password test failed', 
			error: error.message 
		}, { status: 500 });
	}
}
