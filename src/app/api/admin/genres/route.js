// D:\Projek Coding\projek_pkl\src\app\api\admin\genres\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

export async function GET() {
	const db = getDb();
	const rows = db.prepare(`SELECT * FROM genres ORDER BY name`).all();
	return NextResponse.json(rows);
}

export async function POST(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { name } = body || {};
	if (!name) return NextResponse.json({ message: 'name required' }, { status: 400 });
	const info = db.prepare(`INSERT INTO genres (name) VALUES (?)`).run(name);
	return NextResponse.json({ id: info.lastInsertRowid, name }, { status: 201 });
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { id, name } = body || {};
	if (!id || !name) return NextResponse.json({ message: 'id and name required' }, { status: 400 });
	const info = db.prepare(`UPDATE genres SET name = ? WHERE id = ?`).run(name, id);
	if (info.changes === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
	return NextResponse.json({ id, name });
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 });
	const info = db.prepare(`DELETE FROM genres WHERE id = ?`).run(id);
	if (info.changes === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
	return NextResponse.json({ success: true });
}



