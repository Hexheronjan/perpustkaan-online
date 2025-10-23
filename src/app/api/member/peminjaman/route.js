import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

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
	const { ok } = requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get('user_id');
	
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

export async function POST(req) {
	const { ok } = requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const body = await req.json();
	const { 
		user_id, 
		buku_id, 
		tanggal_kembali_target,
		catatan 
	} = body || {};
	
	if (!user_id || !buku_id || !tanggal_kembali_target) {
		return NextResponse.json({ 
			message: 'user_id, buku_id, dan tanggal_kembali_target diperlukan' 
		}, { status: 400 });
	}

	let peminjamanId;
	try {
		await withTransaction(async (client) => {
			// Check if book exists and is approved
			const bukuResult = await client.query(`SELECT * FROM buku WHERE id = $1 AND is_approved = true`, [buku_id]);
			if (bukuResult.rows.length === 0) throw new Error('Buku tidak ditemukan atau belum disetujui');
			const buku = bukuResult.rows[0];
			if (buku.stok_tersedia <= 0) throw new Error('Stok buku habis');
			
			// Check if user already borrowed this book and hasn't returned it
			const existingBorrowResult = await client.query(`
				SELECT * FROM peminjaman 
				WHERE user_id = $1 AND buku_id = $2 AND status = 'dipinjam'
			`, [user_id, buku_id]);
			if (existingBorrowResult.rows.length > 0) throw new Error('Anda sudah meminjam buku ini');

			// Insert peminjaman
			const insertResult = await client.query(`
				INSERT INTO peminjaman (user_id, buku_id, tanggal_kembali_target, catatan) 
				VALUES ($1, $2, $3, $4) RETURNING id
			`, [user_id, buku_id, tanggal_kembali_target, catatan || null]);
			peminjamanId = insertResult.rows[0].id;

			// Update stok buku
			await client.query(`UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = $1`, [buku_id]);
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Peminjaman gagal' }, { status: 400 });
	}

	const result = await db.query(`SELECT * FROM peminjaman WHERE id = $1`, [peminjamanId]);
	return NextResponse.json(mapPeminjaman(result.rows[0]), { status: 201 });
}

export async function PUT(req) {
	// Member tidak bisa mengubah status peminjaman, hanya Admin yang bisa
	return NextResponse.json({ 
		message: 'Method Not Allowed. Member role can only borrow books (POST). Only Admin can update peminjaman status.' 
	}, { status: 405 });
}
