import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
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
	try {
		const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
		if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

		await initDb();
		const db = getDb();

		// Filter only approved books
		const result = await db.query(`
			SELECT * FROM buku 
			WHERE is_approved = true
			ORDER BY created_at DESC
		`);

		return NextResponse.json(result.rows.map(mapBuku));
	} catch (error) {
		console.error('Member Books API Error:', error);
		return NextResponse.json({
			success: false,
			message: 'Error fetching books',
			error: error.message
		}, { status: 500 });
	}
}

// Member role can only view books, not create them directly
// They can borrow books via /api/member/peminjaman
export async function POST() {
	return NextResponse.json({
		message: 'Method Not Allowed. Member role can only view books. Use /api/member/peminjaman to borrow books.'
	}, { status: 405 });
}
