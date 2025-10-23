import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { signJwt, verifyPassword } from '@/lib/auth';

export async function POST(req) {
	try {
		await initDb();
		const db = getDb();
		const { username, email, password } = await req.json();
		if ((!username && !email) || !password) {
			return NextResponse.json({ message: 'username/email dan password diperlukan' }, { status: 400 });
		}

		// Find user by username or email
		const where = username ? 'username = $1' : 'email = $1';
		const value = username || email;
		const userRes = await db.query(`SELECT u.id, u.username, u.email, u.password, u.role_id, u.is_active, r.nama_role
			FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE ${where} LIMIT 1`, [value]);
		if (userRes.rows.length === 0) {
			return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 401 });
		}
		const user = userRes.rows[0];
		if (!user.is_active) {
			return NextResponse.json({ message: 'Akun non-aktif' }, { status: 403 });
		}

		const passwordOk = await verifyPassword(password, user.password);
		if (!passwordOk) {
			return NextResponse.json({ message: 'Kredensial salah' }, { status: 401 });
		}

		const payload = { sub: String(user.id), role: user.nama_role || 'visitor', username: user.username };
		const token = signJwt(payload, { expiresIn: '2h' });

		return NextResponse.json({
			success: true,
			accessToken: token,
			expiresIn: 7200,
			user: { id: user.id, username: user.username, email: user.email, role: payload.role }
		});
	} catch (error) {
		console.error('Login error', error);
		return NextResponse.json({ success: false, message: 'Login gagal', error: error.message }, { status: 500 });
	}
}



