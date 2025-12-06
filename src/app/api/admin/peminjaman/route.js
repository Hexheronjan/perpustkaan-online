// D:\Projek Coding\projek_pkl\src\app\api\admin\peminjaman\route.js
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
	const { ok } = await requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get('user_id');
	const status = searchParams.get('status');

	let query = `SELECT * FROM peminjaman`;
	const params = [];
	let paramCount = 0;

	const conditions = [];
	if (userId) {
		paramCount++;
		conditions.push(`user_id = $${paramCount}`);
		params.push(userId);
	}
	if (status) {
		paramCount++;
		conditions.push(`status = $${paramCount}`);
		params.push(status);
	}

	if (conditions.length > 0) {
		query += ` WHERE ${conditions.join(' AND ')}`;
	}

	query += ` ORDER BY created_at DESC`;

	const result = await db.query(query, params);
	return NextResponse.json(result.rows.map(mapPeminjaman));
}

export async function PUT(req) {
	const { ok } = await requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();
	const body = await req.json();
	const { id, status, catatan, denda } = body || {};

	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });

	try {
		await withTransaction(async (client) => {
			const currentResult = await client.query(`SELECT * FROM peminjaman WHERE id = $1`, [id]);
			if (currentResult.rows.length === 0) throw new Error('Peminjaman tidak ditemukan');
			const current = currentResult.rows[0];

			// If returning book
			if (status === 'dikembalikan') {
				await client.query(`
					UPDATE peminjaman 
					SET status = $1, tanggal_kembali_aktual = CURRENT_TIMESTAMP, 
						catatan = $2, denda = $3, updated_at = CURRENT_TIMESTAMP
					WHERE id = $4
				`, [status, catatan || current.catatan, denda || 0, id]);

				// Update stok buku
				await client.query(`UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = $1`, [current.buku_id]);
			} else if (status === 'ditolak' && current.status === 'pending') {
				// If rejecting a pending request, restore stock
				await client.query(`
					UPDATE peminjaman 
					SET status = $1, catatan = $2, denda = $3, updated_at = CURRENT_TIMESTAMP
					WHERE id = $4
				`, [status, catatan || current.catatan, denda || current.denda || 0, id]);

				// Restore stok buku
				await client.query(`UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = $1`, [current.buku_id]);
			} else {
				await client.query(`
					UPDATE peminjaman 
					SET status = $1, catatan = $2, denda = $3, updated_at = CURRENT_TIMESTAMP
					WHERE id = $4
				`, [status, catatan || current.catatan, denda || current.denda || 0, id]);
			}
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Update gagal' }, { status: 400 });
	}

	const result = await db.query(`SELECT * FROM peminjaman WHERE id = $1`, [id]);
	return NextResponse.json(mapPeminjaman(result.rows[0]));
}

export async function DELETE(req) {
	const { ok } = await requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

	await initDb();
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });

	try {
		await withTransaction(async (client) => {
			// Check if peminjaman exists and is not returned
			const currentResult = await client.query(`SELECT * FROM peminjaman WHERE id = $1`, [id]);
			if (currentResult.rows.length === 0) throw new Error('Peminjaman tidak ditemukan');
			const current = currentResult.rows[0];

			if (current.status === 'dipinjam') {
				// Return the book stock if it's still borrowed
				await client.query(`UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = $1`, [current.buku_id]);
			}

			// Delete the peminjaman record
			await client.query(`DELETE FROM peminjaman WHERE id = $1`, [id]);
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Delete gagal' }, { status: 400 });
	}

	return NextResponse.json({ success: true });
}
