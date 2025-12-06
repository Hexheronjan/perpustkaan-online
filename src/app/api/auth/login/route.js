import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, initDb } from '@/lib/db';
import { signJwt, verifyPassword } from '@/lib/auth';

export async function POST(req) {
	try {
		await initDb();
		const db = getDb();
		const { username, email, password } = await req.json();

		console.log('🔐 Login attempt:', { username, email });

		if ((!username && !email) || !password) {
			return NextResponse.json({
				success: false,
				message: 'username/email dan password diperlukan'
			}, { status: 400 });
		}

		// Find user by username or email
		const where = username ? 'username = $1' : 'email = $1';
		const value = username || email;

		const userRes = await db.query(`
			SELECT u.id, u.username, u.email, u.password, u.nama_lengkap, u.role_id, u.is_active, r.nama_role
			FROM users u 
			LEFT JOIN roles r ON u.role_id = r.id 
			WHERE ${where} 
			LIMIT 1
		`, [value]);

		if (userRes.rows.length === 0) {
			console.log('❌ User tidak ditemukan:', value);
			return NextResponse.json({
				success: false,
				message: 'Username atau password salah'
			}, { status: 401 });
		}

		const user = userRes.rows[0];
		console.log('👤 User found:', { id: user.id, username: user.username, role: user.nama_role });

		if (!user.is_active) {
			console.log('⛔ Akun non-aktif:', user.username);
			return NextResponse.json({
				success: false,
				message: 'Akun Anda telah dinonaktifkan'
			}, { status: 403 });
		}

		// Verify password
		const passwordOk = await verifyPassword(password, user.password);

		if (!passwordOk) {
			console.log('❌ Password salah untuk user:', user.username);
			return NextResponse.json({
				success: false,
				message: 'Username atau password salah'
			}, { status: 401 });
		}

		// Generate JWT
		const payload = {
			sub: String(user.id),
			userId: user.id,
			role: user.nama_role || 'visitor',
			username: user.username,
			role_id: user.role_id
		};

		const token = signJwt(payload, { expiresIn: '2h' });

		// Set cookie
		const cookieStore = await cookies();
		cookieStore.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 7200
		});

		console.log('✅ Login berhasil:', {
			username: user.username,
			role: payload.role,
			tokenLength: token.length
		});

		return NextResponse.json({
			success: true,
			accessToken: token, // Untuk client-auth.js (setToken)
			token: token, // Backup compatibility
			expiresIn: 7200,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				nama_lengkap: user.nama_lengkap,
				role: payload.role,
				role_id: user.role_id
			}
		});

	} catch (error) {
		console.error('💥 Login error:', error);
		return NextResponse.json({
			success: false,
			message: 'Terjadi kesalahan saat login',
			error: error.message
		}, { status: 500 });
	}
}