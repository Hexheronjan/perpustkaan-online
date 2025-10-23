// D:\Projek Coding\projek_pkl\src\app\api\admin\books\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

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
	// Any role can view; Admin has full list including unapproved
	const role = getRoleFromRequest(req);
	const db = getDb();
	const includeUnapproved = role === ROLES.ADMIN || role === ROLES.STAF;
	const rows = includeUnapproved
		? db.prepare(`SELECT * FROM books`).all()
		: db.prepare(`SELECT * FROM books WHERE is_approved = 1`).all();
	return NextResponse.json(rows.map(mapBook));
}

export async function POST(req) {
	// Admin can directly add approved books
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { title, author, genreId, stock = 0, tagIds = [] } = body || {};
	if (!title) return NextResponse.json({ message: 'title required' }, { status: 400 });

	let createdId;
	withTransaction(() => {
		const insert = db.prepare(`INSERT INTO books (title, author, genre_id, stock, is_approved) VALUES (?, ?, ?, ?, 1)`);
		const info = insert.run(title, author || null, genreId || null, Number(stock) || 0);
		createdId = info.lastInsertRowid;
		if (Array.isArray(tagIds) && tagIds.length) {
			const insertTag = db.prepare(`INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)`);
			for (const tagId of tagIds) insertTag.run(createdId, tagId);
		}
	});

	const row = db.prepare(`SELECT * FROM books WHERE id = ?`).get(createdId);
	return NextResponse.json(mapBook(row), { status: 201 });
}

export async function PUT(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { id, title, author, genreId, stock, isApproved, tagIds } = body || {};
	if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 });

	withTransaction(() => {
		const current = db.prepare(`SELECT * FROM books WHERE id = ?`).get(id);
		if (!current) throw new Error('Not found');
		const next = {
			title: title ?? current.title,
			author: author ?? current.author,
			genre_id: genreId ?? current.genre_id,
			stock: typeof stock === 'number' ? stock : current.stock,
			is_approved: typeof isApproved === 'boolean' ? (isApproved ? 1 : 0) : current.is_approved,
		};
		db.prepare(`UPDATE books SET title = @title, author = @author, genre_id = @genre_id, stock = @stock, is_approved = @is_approved WHERE id = @id`).run({ ...next, id });
		if (Array.isArray(tagIds)) {
			db.prepare(`DELETE FROM book_tags WHERE book_id = ?`).run(id);
			const insertTag = db.prepare(`INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)`);
			for (const tagId of tagIds) insertTag.run(id, tagId);
		}
	});

	const row = db.prepare(`SELECT * FROM books WHERE id = ?`).get(id);
	return NextResponse.json(mapBook(row));
}

export async function DELETE(req) {
	const { ok } = requireRole(req, [ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get('id'));
	if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 });
	const info = db.prepare(`DELETE FROM books WHERE id = ?`).run(id);
	if (info.changes === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
	return NextResponse.json({ success: true });
}



