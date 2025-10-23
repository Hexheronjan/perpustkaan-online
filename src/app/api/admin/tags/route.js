// D:\Projek Coding\projek_pkl\src\app\api\admin\tags\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

export async function GET() {
	const db = getDb();
	const result = await db.query(`SELECT * FROM tags ORDER BY nama_tag`);
	return NextResponse.json(result.rows);
}

export async function POST(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { nama_tag } = body || {};
	if (!nama_tag) return NextResponse.json({ message: 'nama_tag diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`INSERT INTO tags (nama_tag) VALUES ($1) RETURNING id`, [nama_tag]);
		return NextResponse.json({ id: result.rows[0].id, nama_tag }, { status: 201 });
	} catch (error) {
		console.error('Error creating tag:', error);
		return NextResponse.json({ message: 'Error creating tag', error: error.message }, { status: 500 });
	}
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { id, nama_tag } = body || {};
	if (!id || !nama_tag) return NextResponse.json({ message: 'id dan nama_tag diperlukan' }, { status: 400 });
	
	try {
		const result = await db.query(`UPDATE tags SET nama_tag = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [nama_tag, id]);
		if (result.rowCount === 0) return NextResponse.json({ message: 'Tag tidak ditemukan' }, { status: 404 });
		return NextResponse.json({ id, nama_tag });
	} catch (error) {
		console.error('Error updating tag:', error);
		return NextResponse.json({ message: 'Error updating tag', error: error.message }, { status: 500 });
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
		const result = await db.query(`DELETE FROM tags WHERE id = $1`, [id]);
		if (result.rowCount === 0) return NextResponse.json({ message: 'Tag tidak ditemukan' }, { status: 404 });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting tag:', error);
		return NextResponse.json({ message: 'Error deleting tag', error: error.message }, { status: 500 });
	}
}
