import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
	try {
		await initDb();
		const db = getDb();
		
		// Get all users with their roles
		const result = await db.query(`
			SELECT u.id, u.username, u.email, u.password, u.role_id, u.is_active, r.nama_role
			FROM users u LEFT JOIN roles r ON u.role_id = r.id
			ORDER BY u.id
		`);
		
		return NextResponse.json({
			success: true,
			users: result.rows.map(user => ({
				id: user.id,
				username: user.username,
				email: user.email,
				role_id: user.role_id,
				nama_role: user.nama_role,
				is_active: user.is_active,
				password_hash: user.password ? user.password.substring(0, 20) + '...' : null
			}))
		});
	} catch (error) {
		console.error('Debug users error:', error);
		return NextResponse.json({ 
			success: false, 
			message: 'Debug failed', 
			error: error.message 
		}, { status: 500 });
	}
}