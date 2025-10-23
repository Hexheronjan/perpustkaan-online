// D:\Projek Coding\projek_pkl\src\app\api\admin\approve\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();

	try {
		const result = await db.query(`
			SELECT 
				bp.id,
				bp.judul,
				bp.penulis,
				bp.penerbit,
				bp.tahun_terbit,
				bp.isbn,
				bp.jumlah_halaman,
				bp.deskripsi,
				bp.stok_tersedia,
				bp.stok_total,
				bp.sampul_buku,
				bp.genre_id,
				bp.status,
				bp.diajukan_oleh,
				bp.disetujui_oleh,
				bp.catatan_admin,
				bp.created_at,
				bp.updated_at,
				g.nama_genre
			FROM buku_pending bp
			LEFT JOIN genre g ON bp.genre_id = g.id
			WHERE bp.status = 'pending'
			ORDER BY bp.created_at DESC
		`);
		return NextResponse.json(result.rows);
	} catch (error) {
		return NextResponse.json({ message: 'Failed to fetch pending books', error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();

	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
	}

	const { bookId, approve = true } = body || {};
	if (!bookId) return NextResponse.json({ message: 'bookId required' }, { status: 400 });

	try {
		await withTransaction(async (client) => {
			// Update buku approval flag
			const updateResult = await client.query(
				`UPDATE buku SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
				[approve === true, bookId]
			);
			if (updateResult.rowCount === 0) {
				throw new Error('Book not found');
			}
		});

		const result = await db.query(`SELECT * FROM buku WHERE id = $1`, [bookId]);
		if (result.rows.length === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
		const row = result.rows[0];
		return NextResponse.json({ id: row.id, isApproved: !!row.is_approved });
	} catch (error) {
		return NextResponse.json({ message: 'Approve failed', error: error.message }, { status: 500 });
	}
}





