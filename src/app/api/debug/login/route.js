import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(req) {
	try {
		await initDb();
		const db = getDb();
		const { username, password } = await req.json();
		
		if (!username || !password) {
			return NextResponse.json({ message: 'username dan password diperlukan' }, { status: 400 });
		}

		// Debug: Log input
		console.log('Debug login - Username:', username);
		console.log('Debug login - Password:', password);

		// Find user by username
		const userRes = await db.query(`SELECT u.id, u.username, u.email, u.password, u.role_id, u.is_active, r.nama_role
			FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = $1 LIMIT 1`, [username]);
		
		console.log('Debug login - Query result:', userRes.rows.length);
		
		if (userRes.rows.length === 0) {
			return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 401 });
		}
		
		const user = userRes.rows[0];
		console.log('Debug login - User found:', {
			id: user.id,
			username: user.username,
			role_id: user.role_id,
			nama_role: user.nama_role,
			is_active: user.is_active,
			password_length: user.password ? user.password.length : 0
		});

		if (!user.is_active) {
			return NextResponse.json({ message: 'Akun non-aktif' }, { status: 403 });
		}

		// Debug: Test password verification
		console.log('Debug login - Testing password verification...');
		const passwordOk = await verifyPassword(password, user.password);
		console.log('Debug login - Password verification result:', passwordOk);

		if (!passwordOk) {
			return NextResponse.json({ 
				message: 'Kredensial salah',
				debug: {
					username: username,
					userFound: true,
					passwordLength: user.password ? user.password.length : 0,
					passwordHash: user.password ? user.password.substring(0, 20) + '...' : null
				}
			}, { status: 401 });
		}

		return NextResponse.json({
			success: true,
			message: 'Login berhasil (debug mode)',
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.nama_role
			}
		});
	} catch (error) {
		console.error('Debug login error:', error);
		return NextResponse.json({ 
			success: false, 
			message: 'Debug login failed', 
			error: error.message 
		}, { status: 500 });
	}
}
