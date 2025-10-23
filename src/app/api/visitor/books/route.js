import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getRoleFromRequest, ROLES } from '@/lib/roles';

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
	// Visitor dapat melihat katalog tanpa login, tapi tetap validasi role
	const role = getRoleFromRequest(req);
	
	// Visitor, Member, Staf, dan Admin semua bisa melihat katalog
	if (![ROLES.VISITOR, ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN].includes(role)) {
		return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}
	
	const db = getDb();
	const rows = db.prepare(`SELECT * FROM books WHERE is_approved = 1`).all();
	return NextResponse.json(rows.map(mapBook));
}







