import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

function mapBook(row) {
	return {
		id: row.id,
		title: row.title,
		author: row.author,
		genreId: row.genre_id,
		stock: row.stock,
		isApproved: !!row.is_approved,
		createdAt: row.created_at,
	};
}

export async function GET(req) {
	const { ok } = requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const rows = db.prepare(`SELECT * FROM books WHERE is_approved = 1`).all();
	return NextResponse.json(rows.map(mapBook));
}







