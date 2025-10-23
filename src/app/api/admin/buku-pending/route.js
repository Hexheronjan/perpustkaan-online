// D:\Projek Coding\projek_pkl\src\app\api\admin\buku-pending\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

function mapBukuPending(row) {
	return {
		id: row.id,
		judul: row.judul,
		penulis: row.penulis,
		penerbit: row.penerbit,
		tahun_terbit: row.tahun_terbit,
		isbn: row.isbn,
		jumlah_halaman: row.jumlah_halaman,
		deskripsi: row.deskripsi,
		stok_tersedia: row.stok_tersedia,
		stok_total: row.stok_total,
		sampul_buku: row.sampul_buku,
		genre_id: row.genre_id,
		status: row.status,
		diajukan_oleh: row.diajukan_oleh,
		disetujui_oleh: row.disetujui_oleh,
		catatan_admin: row.catatan_admin,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function GET(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const status = searchParams.get('status');
	
	let query = `SELECT * FROM buku_pending`;
	const params = [];
	
	if (status) {
		query += ` WHERE status = ?`;
		params.push(status);
	}
	
	query += ` ORDER BY created_at DESC`;
	
	const rows = db.prepare(query).all(...params);
	return NextResponse.json(rows.map(mapBukuPending));
}

export async function POST(req) {
	// Approve or reject pending book
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { 
		id, 
		action, // 'approve' or 'reject'
		catatan_admin,
		disetujui_oleh = 1 // Default admin user ID
	} = body || {};
	
	if (!id || !action) {
		return NextResponse.json({ 
			message: 'id dan action (approve/reject) diperlukan' 
		}, { status: 400 });
	}

	if (!['approve', 'reject'].includes(action)) {
		return NextResponse.json({ 
			message: 'action harus approve atau reject' 
		}, { status: 400 });
	}

	try {
		withTransaction(() => {
			const pending = db.prepare(`SELECT * FROM buku_pending WHERE id = ? AND status = 'pending'`).get(id);
			if (!pending) throw new Error('Buku pending tidak ditemukan atau sudah diproses');

			if (action === 'approve') {
				// Insert into main buku table
				const insertBuku = db.prepare(`
					INSERT INTO buku (
						judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman,
						deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id, is_approved
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
				`);
				
				const bukuInfo = insertBuku.run(
					pending.judul,
					pending.penulis,
					pending.penerbit,
					pending.tahun_terbit,
					pending.isbn,
					pending.jumlah_halaman,
					pending.deskripsi,
					pending.stok_tersedia,
					pending.stok_total,
					pending.sampul_buku,
					pending.genre_id
				);
				
				const bukuId = bukuInfo.lastInsertRowid;
				
				// Copy tags from pending to main table
				const pendingTags = db.prepare(`SELECT tag_id FROM buku_pending_tags WHERE buku_pending_id = ?`).all(id);
				const insertTag = db.prepare(`INSERT OR IGNORE INTO buku_tags (buku_id, tag_id) VALUES (?, ?)`);
				for (const tag of pendingTags) {
					insertTag.run(bukuId, tag.tag_id);
				}
			}

			// Update pending status
			const newStatus = action === 'approve' ? 'approved' : 'rejected';
			db.prepare(`
				UPDATE buku_pending 
				SET status = ?, disetujui_oleh = ?, catatan_admin = ?, updated_at = datetime('now')
				WHERE id = ?
			`).run(newStatus, disetujui_oleh, catatan_admin || null, id);
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Proses approval gagal' }, { status: 400 });
	}

	const row = db.prepare(`SELECT * FROM buku_pending WHERE id = ?`).get(id);
	return NextResponse.json(mapBukuPending(row));
}
