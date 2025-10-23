import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { getRoleFromRequest, ROLES } from '@/lib/roles';

export async function GET(req) {
	// Visitor dapat melihat genre tanpa login, tapi tetap validasi role
	const role = getRoleFromRequest(req);
	
	// Visitor, Member, Staf, dan Admin semua bisa melihat genre
	if (![ROLES.VISITOR, ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN].includes(role)) {
		return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	}
	
	try {
		await initDb();
		const db = getDb();
		const result = await db.query(`SELECT * FROM genre ORDER BY nama_genre`);
		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('Visitor Genre API Error:', error);
		return NextResponse.json({
			success: false,
			message: 'Error fetching genres',
			error: error.message
		}, { status: 500 });
	}
}
