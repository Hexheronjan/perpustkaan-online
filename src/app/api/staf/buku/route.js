import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

function mapBuku(row) {
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
		is_approved: !!row.is_approved,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function GET(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const result = await db.query(`SELECT * FROM buku`);
	return NextResponse.json(result.rows.map(mapBuku));
}

export async function POST(req) {
	// Staf creates book as pending; requires admin approval
	const { ok, role } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const body = await req.json();
	const { 
		judul, 
		penulis, 
		penerbit,
		tahun_terbit,
		isbn,
		jumlah_halaman,
		deskripsi,
		stok_tersedia = 0, 
		stok_total = 0,
		sampul_buku,
		genre_id, 
		tag_ids = [], 
		diajukan_oleh = 2 // Default staf user ID
	} = body || {};
	
	if (!judul || !penulis) {
		return NextResponse.json({ 
			message: 'judul dan penulis diperlukan' 
		}, { status: 400 });
	}

	let createdId;
	try {
		await withTransaction(async (client) => {
			const insertResult = await client.query(`
				INSERT INTO buku_pending (
					judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
					deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id, 
					status, diajukan_oleh
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
				RETURNING id
			`, [
				judul, 
				penulis, 
				penerbit || null,
				tahun_terbit || null,
				isbn || null,
				jumlah_halaman || null,
				deskripsi || null,
				Number(stok_tersedia) || 0,
				Number(stok_total) || 0,
				sampul_buku || null,
				genre_id || null,
				diajukan_oleh
			]);
			createdId = insertResult.rows[0].id;
			
			// Insert tags if provided
			if (Array.isArray(tag_ids) && tag_ids.length) {
				for (const tagId of tag_ids) {
					await client.query(`
						INSERT INTO buku_pending_tags (buku_pending_id, tag_id) 
						VALUES ($1, $2) 
						ON CONFLICT (buku_pending_id, tag_id) DO NOTHING
					`, [createdId, tagId]);
				}
			}
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Gagal membuat buku pending' }, { status: 400 });
	}

	const result = await db.query(`SELECT * FROM buku_pending WHERE id = $1`, [createdId]);
	return NextResponse.json({ 
		...mapBuku(result.rows[0]), 
		status: 'pending',
		approvalStatus: 'pending' 
	}, { status: 201 });
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const body = await req.json();
	const { 
		id, 
		judul, 
		penulis, 
		penerbit,
		tahun_terbit,
		isbn,
		jumlah_halaman,
		deskripsi,
		stok_tersedia,
		stok_total,
		sampul_buku,
		genre_id, 
		tag_ids 
	} = body || {};
	
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });

	try {
		await withTransaction(async (client) => {
			const currentResult = await client.query(`SELECT * FROM buku WHERE id = $1`, [id]);
			if (currentResult.rows.length === 0) throw new Error('Buku tidak ditemukan');
			const current = currentResult.rows[0];
			
			const updateData = {
				judul: judul ?? current.judul,
				penulis: penulis ?? current.penulis,
				penerbit: penerbit ?? current.penerbit,
				tahun_terbit: tahun_terbit ?? current.tahun_terbit,
				isbn: isbn ?? current.isbn,
				jumlah_halaman: jumlah_halaman ?? current.jumlah_halaman,
				deskripsi: deskripsi ?? current.deskripsi,
				stok_tersedia: typeof stok_tersedia === 'number' ? stok_tersedia : current.stok_tersedia,
				stok_total: typeof stok_total === 'number' ? stok_total : current.stok_total,
				sampul_buku: sampul_buku ?? current.sampul_buku,
				genre_id: genre_id ?? current.genre_id,
				updated_at: new Date().toISOString()
			};
			
			await client.query(`
				UPDATE buku SET 
					judul = $1, penulis = $2, penerbit = $3,
					tahun_terbit = $4, isbn = $5, jumlah_halaman = $6,
					deskripsi = $7, stok_tersedia = $8, stok_total = $9,
					sampul_buku = $10, genre_id = $11, updated_at = $12
				WHERE id = $13
			`, [
				updateData.judul, updateData.penulis, updateData.penerbit,
				updateData.tahun_terbit, updateData.isbn, updateData.jumlah_halaman,
				updateData.deskripsi, updateData.stok_tersedia, updateData.stok_total,
				updateData.sampul_buku, updateData.genre_id, updateData.updated_at,
				id
			]);
			
			// Update tags if provided
			if (Array.isArray(tag_ids)) {
				await client.query(`DELETE FROM buku_tags WHERE buku_id = $1`, [id]);
				for (const tagId of tag_ids) {
					await client.query(`
						INSERT INTO buku_tags (buku_id, tag_id) 
						VALUES ($1, $2) 
						ON CONFLICT (buku_id, tag_id) DO NOTHING
					`, [id, tagId]);
				}
			}
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Update gagal' }, { status: 400 });
	}

	const result = await db.query(`SELECT * FROM buku WHERE id = $1`, [id]);
	return NextResponse.json(mapBuku(result.rows[0]));
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	await initDb();
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });
	
	const result = await db.query(`DELETE FROM buku WHERE id = $1`, [id]);
	if (result.rowCount === 0) return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
	return NextResponse.json({ success: true });
}
