import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

initDb();

export async function POST(req) {
	const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const body = await req.json();
	const { bookId, memberId } = body || {};
	if (!bookId || !memberId) return NextResponse.json({ message: 'bookId and memberId required' }, { status: 400 });

	let borrowId;
	try {
		withTransaction(() => {
			const book = db.prepare(`SELECT * FROM books WHERE id = ? AND is_approved = 1`).get(bookId);
			if (!book) throw new Error('Book not found or not approved');
			if (book.stock <= 0) throw new Error('Out of stock');
			db.prepare(`UPDATE books SET stock = stock - 1 WHERE id = ?`).run(bookId);
			const info = db.prepare(`INSERT INTO borrows (book_id, member_id) VALUES (?, ?)`).run(bookId, String(memberId));
			borrowId = info.lastInsertRowid;
		});
	} catch (e) {
		return NextResponse.json({ message: e.message || 'Borrow failed' }, { status: 400 });
	}

	return NextResponse.json({ success: true, borrowId });
}







