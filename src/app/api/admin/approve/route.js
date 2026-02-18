// D:\Projek Coding\projek_pkl\src\app\api\admin\approve\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
	const { ok } = await requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();

	try {
		const result = await db.query(`
			SELECT 
				b.id,
				b.judul,
				b.penulis,
				b.penerbit,
				b.tahun_terbit,
				b.isbn,
				b.jumlah_halaman,
				b.deskripsi,
				b.stok_tersedia,
				b.stok_total,
				b.sampul_buku,
				b.genre_id,
				b.status,
				b.created_by,
				b.approved_by,
				b.created_at,
				b.updated_at,
				g.nama_genre
			FROM buku b
			LEFT JOIN genre g ON b.genre_id = g.id
			WHERE b.status = 'pending'
			ORDER BY b.created_at DESC
		`);
		return NextResponse.json(result.rows);
	} catch (error) {
		return NextResponse.json({ message: 'Failed to fetch pending books', error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	const { ok } = await requireRole(req, [ROLES.ADMIN]);
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
			const newStatus = approve === true ? 'approved' : 'rejected';
			const updateResult = await client.query(
				`UPDATE buku SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
				[newStatus, bookId]
			);
			if (updateResult.rowCount === 0) {
				throw new Error('Book not found');
			}
		});

		const result = await db.query(`SELECT * FROM buku WHERE id = $1`, [bookId]);
		if (result.rows.length === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
		const row = result.rows[0];
		return NextResponse.json({ id: row.id, status: row.status });
	} catch (error) {
		return NextResponse.json({ message: 'Approve failed', error: error.message }, { status: 500 });
	}
}





