import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

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

export async function GET() {
	try {
		await initDb();
		const db = getDb();
		
		// Check if is_approved column exists
		const columns = await db.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'buku' AND column_name = 'is_approved'
		`);
		
		const hasIsApproved = columns.rows.length > 0;
		let result;
		
		if (hasIsApproved) {
			result = await db.query(`SELECT * FROM buku WHERE is_approved = true`);
		} else {
			// Fallback: return all books if is_approved column doesn't exist
			result = await db.query(`SELECT * FROM buku`);
		}
		
		return NextResponse.json({
			success: true,
			message: 'Member books (no auth required for testing)',
			has_is_approved: hasIsApproved,
			data: result.rows.map(mapBuku)
		});
	} catch (error) {
		console.error('Test Member Books API Error:', error);
		return NextResponse.json({
			success: false,
			message: 'Error fetching books',
			error: error.message
		}, { status: 500 });
	}
}



