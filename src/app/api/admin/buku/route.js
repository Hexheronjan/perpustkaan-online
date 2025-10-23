// D:\Projek Coding\projek_pkl\src\app\api\admin\buku\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

initDb();

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
	// Any role can view; Admin has full list including unapproved
	const role = getRoleFromRequest(req);
	const db = getDb();
	const includeUnapproved = role === ROLES.ADMIN || role === ROLES.STAF;
	
	try {
		// Try to query with is_approved column first
		const result = includeUnapproved
			? await db.query(`SELECT * FROM buku`)
			: await db.query(`SELECT * FROM buku WHERE is_approved = true`);
		return NextResponse.json(result.rows.map(mapBuku));
	} catch (error) {
		// If is_approved column doesn't exist, fallback to all books
		if (error.code === '42703' && error.message.includes('is_approved')) {
			console.log('is_approved column not found, returning all books');
			const result = await db.query(`SELECT * FROM buku`);
			return NextResponse.json(result.rows.map(mapBuku));
		}
		throw error;
	}
}

export async function POST(req) {
	// Admin can directly add approved books
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
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
		tag_ids = [] 
	} = body || {};
	
	if (!judul || !penulis) {
		return NextResponse.json({ 
			message: 'judul dan penulis diperlukan' 
		}, { status: 400 });
	}

	try {
		const createdId = await withTransaction(async (client) => {
			const insert = await client.query(`
				INSERT INTO buku (
					judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
					deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id, is_approved
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
				true
			]);
			
			const id = insert.rows[0].id;
			
			// Insert tags if provided
			if (Array.isArray(tag_ids) && tag_ids.length) {
				for (const tagId of tag_ids) {
					await client.query(`INSERT INTO buku_tags (buku_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, tagId]);
				}
			}
			
			return id;
		});

		const result = await db.query(`SELECT * FROM buku WHERE id = $1`, [createdId]);
		return NextResponse.json(mapBuku(result.rows[0]), { status: 201 });
	} catch (error) {
		console.error('Error creating book:', error);
		return NextResponse.json({ message: 'Error creating book', error: error.message }, { status: 500 });
	}
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
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
		is_approved,
		tag_ids 
	} = body || {};
	
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });

	try {
		await withTransaction(async (client) => {
			const current = await client.query(`SELECT * FROM buku WHERE id = $1`, [id]);
			if (current.rows.length === 0) throw new Error('Buku tidak ditemukan');
			
			const currentData = current.rows[0];
			const updateData = {
				judul: judul ?? currentData.judul,
				penulis: penulis ?? currentData.penulis,
				penerbit: penerbit ?? currentData.penerbit,
				tahun_terbit: tahun_terbit ?? currentData.tahun_terbit,
				isbn: isbn ?? currentData.isbn,
				jumlah_halaman: jumlah_halaman ?? currentData.jumlah_halaman,
				deskripsi: deskripsi ?? currentData.deskripsi,
				stok_tersedia: typeof stok_tersedia === 'number' ? stok_tersedia : currentData.stok_tersedia,
				stok_total: typeof stok_total === 'number' ? stok_total : currentData.stok_total,
				sampul_buku: sampul_buku ?? currentData.sampul_buku,
				genre_id: genre_id ?? currentData.genre_id,
				is_approved: typeof is_approved === 'boolean' ? is_approved : currentData.is_approved,
			};
			
			await client.query(`
				UPDATE buku SET 
					judul = $1, penulis = $2, penerbit = $3,
					tahun_terbit = $4, isbn = $5, jumlah_halaman = $6,
					deskripsi = $7, stok_tersedia = $8, stok_total = $9,
					sampul_buku = $10, genre_id = $11, is_approved = $12, updated_at = CURRENT_TIMESTAMP
				WHERE id = $13
			`, [
				updateData.judul, updateData.penulis, updateData.penerbit,
				updateData.tahun_terbit, updateData.isbn, updateData.jumlah_halaman,
				updateData.deskripsi, updateData.stok_tersedia, updateData.stok_total,
				updateData.sampul_buku, updateData.genre_id, updateData.is_approved, id
			]);
			
			// Update tags if provided
			if (Array.isArray(tag_ids)) {
				await client.query(`DELETE FROM buku_tags WHERE buku_id = $1`, [id]);
				for (const tagId of tag_ids) {
					await client.query(`INSERT INTO buku_tags (buku_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, tagId]);
				}
			}
		});

		const result = await db.query(`SELECT * FROM buku WHERE id = $1`, [id]);
		return NextResponse.json(mapBuku(result.rows[0]));
	} catch (error) {
		console.error('Error updating book:', error);
		return NextResponse.json({ message: 'Error updating book', error: error.message }, { status: 500 });
	}
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`DELETE FROM buku WHERE id = $1`, [id]);
		if (result.rowCount === 0) return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting book:', error);
		return NextResponse.json({ message: 'Error deleting book', error: error.message }, { status: 500 });
	}
}
