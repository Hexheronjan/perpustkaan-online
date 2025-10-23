// D:\Projek Coding\projek_pkl\src\app\api\admin\genre\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

export async function GET() {
	const db = getDb();
	const result = await db.query(`SELECT * FROM genre ORDER BY nama_genre`);
	return NextResponse.json(result.rows);
}

export async function POST(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { nama_genre, deskripsi } = body || {};
	if (!nama_genre) return NextResponse.json({ message: 'nama_genre diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`INSERT INTO genre (nama_genre, deskripsi) VALUES ($1, $2) RETURNING id`, [nama_genre, deskripsi || null]);
		return NextResponse.json({ id: result.rows[0].id, nama_genre, deskripsi }, { status: 201 });
	} catch (error) {
		console.error('Error creating genre:', error);
		return NextResponse.json({ message: 'Error creating genre', error: error.message }, { status: 500 });
	}
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { id, nama_genre, deskripsi } = body || {};
	if (!id || !nama_genre) return NextResponse.json({ message: 'id dan nama_genre diperlukan' }, { status: 400 });
	
	const info = db.prepare(`UPDATE genre SET nama_genre = ?, deskripsi = ?, updated_at = datetime('now') WHERE id = ?`).run(nama_genre, deskripsi || null, id);
	if (info.changes === 0) return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
	return NextResponse.json({ id, nama_genre, deskripsi });
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });
	
	const info = db.prepare(`DELETE FROM genre WHERE id = ?`).run(id);
	if (info.changes === 0) return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
	return NextResponse.json({ success: true });
}
