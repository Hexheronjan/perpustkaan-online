// src/app/api/member/borrow/route.js
// Legacy borrow endpoint — redirects logic to the main peminjaman system
import { NextResponse } from 'next/server';
import { getDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function POST(req) {
	const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	const db = getDb();
	const body = await req.json();
	const { bookId, memberId } = body || {};
	if (!bookId || !memberId) {
		return NextResponse.json({ message: 'bookId and memberId required' }, { status: 400 });
	}

	try {
		const borrowId = await withTransaction(async (client) => {
			// Check book exists and is approved in main buku table
			const bookResult = await client.query(
				`SELECT * FROM buku WHERE id = $1 AND is_approved = true`,
				[bookId]
			);
			if (bookResult.rows.length === 0) throw new Error('Book not found or not approved');
			const book = bookResult.rows[0];
			if (book.stok_tersedia <= 0) throw new Error('Out of stock');

			// Reduce stock
			await client.query(`UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = $1`, [bookId]);

			// Insert into peminjaman table
			const tanggalKembali = new Date();
			tanggalKembali.setDate(tanggalKembali.getDate() + 7);
			const insertResult = await client.query(
				`INSERT INTO peminjaman (user_id, buku_id, tanggal_kembali_target, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
				[memberId, bookId, tanggalKembali.toISOString()]
			);
			return insertResult.rows[0].id;
		});

		return NextResponse.json({ success: true, borrowId });
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Borrow failed' }, { status: 400 });
	}
}
