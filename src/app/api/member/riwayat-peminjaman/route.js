import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES, getRoleFromRequest } from '@/lib/roles';

function mapPeminjaman(row) {
	return {
		id: row.id,
		user_id: row.user_id,
		buku_id: row.buku_id,
		tanggal_pinjam: row.tanggal_pinjam,
		tanggal_kembali_target: row.tanggal_kembali_target,
		tanggal_kembali_aktual: row.tanggal_kembali_aktual,
		status: row.status,
		denda: row.denda,
		catatan: row.catatan,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function GET(req) {
	const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get('user_id');

	// Member hanya bisa melihat peminjaman mereka sendiri
	const role = await getRoleFromRequest(req);
	if (role === ROLES.MEMBER && !userId) {
		return NextResponse.json({
			message: 'user_id diperlukan untuk Member role'
		}, { status: 400 });
	}

	let query = `SELECT * FROM peminjaman`;
	const params = [];

	if (userId) {
		query += ` WHERE user_id = $1`;
		params.push(userId);
	}

	query += ` ORDER BY created_at DESC`;

	const result = await db.query(query, params);
	return NextResponse.json(result.rows.map(mapPeminjaman));
}
