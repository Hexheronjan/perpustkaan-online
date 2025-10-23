import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

export async function GET(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const result = await db.query(`SELECT * FROM genre ORDER BY nama_genre`);
	return NextResponse.json(result.rows);
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { id, nama_genre, deskripsi } = body || {};
	if (!id || !nama_genre) return NextResponse.json({ message: 'id dan nama_genre diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`UPDATE genre SET nama_genre = $1, deskripsi = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`, [nama_genre, deskripsi || null, id]);
		if (result.rowCount === 0) return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
		return NextResponse.json({ id, nama_genre, deskripsi });
	} catch (error) {
		console.error('Error updating genre:', error);
		return NextResponse.json({ message: 'Error updating genre', error: error.message }, { status: 500 });
	}
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`DELETE FROM genre WHERE id = $1`, [id]);
		if (result.rowCount === 0) return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting genre:', error);
		return NextResponse.json({ message: 'Error deleting genre', error: error.message }, { status: 500 });
	}
}
