// src/app/api/member/genres/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
	try {
		const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
		if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

		const db = getDb();
		const result = await db.query(`
      SELECT 
        id,
        nama_genre as name,
        deskripsi as description,
        created_at as "createdAt"
      FROM genre 
      ORDER BY nama_genre ASC
    `);

		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('❌ Member Genres API Error:', error);
		return NextResponse.json({
			success: false,
			message: 'Error fetching genres',
			error: error.message
		}, { status: 500 });
	}
}
